import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import type { Server } from 'http';
import { redis, KEYS } from './src/redis';
import { log, shortId } from './src/logger';

type MemberStatus = 'idle' | 'waiting' | 'matched';

interface Member {
  id: string;
  socket: WebSocket;
  partnerId: string | null;
  status: MemberStatus;
  /** Liveness flag toggled by the native ws ping/pong heartbeat. */
  isAlive: boolean;
}

// Presence: a member is "online" if seen within this window. Auto-expires
// ghosts (e.g. an instance that crashed without cleaning up).
const ONLINE_WINDOW_MS = 60_000;
// How often the server pings clients + refreshes presence.
const HEARTBEAT_INTERVAL_MS = 30_000;
// Cap inbound frame size to prevent abuse (signaling payloads are small).
const MAX_PAYLOAD_BYTES = 64 * 1024;

/**
 * Owns the WebSocket server and matchmaking.
 *
 * Shared state (waiting queue + online presence) lives in Redis so it survives
 * restarts and is consistent. Live sockets are necessarily per-instance (a TCP
 * connection can't be serialized), so signal relay is in-process; cross-
 * instance relay would require pub/sub (a future step).
 */
export class MemberManager {
  private static instance: MemberManager;

  private wss: WebSocketServer | null = null;
  private members: Map<string, Member> = new Map();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  /** Serializes matchmaking so concurrent triggers don't double-match. */
  private matching = false;

  private constructor() {}

  static getInstance(): MemberManager {
    if (!MemberManager.instance) {
      MemberManager.instance = new MemberManager();
    }
    return MemberManager.instance;
  }

  init(target: Server | number = 4000) {
    if (this.wss) {
      log.warn('ws', 'WebSocket server already running');
      return;
    }

    const opts = { maxPayload: MAX_PAYLOAD_BYTES };
    if (typeof target === 'number') {
      this.wss = new WebSocketServer({ port: target, ...opts });
      log.info('ws', `WebSocket server listening on ws://localhost:${target}`);
    } else {
      this.wss = new WebSocketServer({ server: target, ...opts });
      log.info('ws', 'WebSocket server attached to HTTP server');
    }

    this.wss.on('connection', (socket: WebSocket) => {
      void this.handleConnection(socket);
    });

    this.startHeartbeat();
    log.info('ws', 'matchmaker ready', {
      heartbeat: `${HEARTBEAT_INTERVAL_MS / 1000}s`,
    });
  }

  /** Gracefully stop the server (used on shutdown). */
  async shutdown() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;

    log.info('ws', 'shutting down — cleaning up sockets', {
      sockets: this.members.size,
    });

    // Best-effort cleanup of this instance's members from shared state.
    const ids = [...this.members.keys()];
    await Promise.allSettled(
      ids.map((id) => this.cleanupSharedState(id))
    ).catch(() => {});

    this.members.forEach(({ socket }) => socket.close());
    this.members.clear();
    this.wss?.close();
    this.wss = null;
  }

  private async handleConnection(socket: WebSocket) {
    const id = randomUUID();
    const member: Member = {
      id,
      socket,
      partnerId: null,
      status: 'idle',
      isAlive: true,
    };
    this.members.set(id, member);

    socket.on('pong', () => {
      const m = this.members.get(id);
      if (m) m.isAlive = true;
    });

    socket.on('message', (raw) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      void this.handleMessage(id, msg);
    });

    socket.on('close', () => {
      void this.handleDisconnect(id);
    });

    socket.on('error', (err) => {
      log.error('ws', 'socket error', { id: shortId(id), err: err.message });
      void this.handleDisconnect(id);
    });

    try {
      await this.touchPresence(id);
      this.send(socket, { type: 'connected', id });
      const online = await this.broadcastOnlineCount();
      log.info('connect', `new person joined`, {
        id: shortId(id),
        sockets: this.members.size,
        online,
      });
    } catch (err) {
      log.error('connect', 'presence error', { id: shortId(id), err: String(err) });
    }
  }

  private async handleMessage(id: string, msg: any) {
    const member = this.members.get(id);
    if (!member) return;

    try {
      switch (msg?.type) {
        case 'ping':
          this.send(member.socket, { type: 'pong' });
          break;
        case 'start':
          await this.enqueue(id);
          break;
        case 'stop':
          await this.stop(id);
          break;
        case 'next':
          await this.next(id);
          break;
        case 'signal':
          this.relaySignal(id, msg.signal);
          break;
        default:
          break;
      }
    } catch (err) {
      log.error('message', `error handling "${msg?.type}"`, {
        id: shortId(id),
        err: String(err),
      });
    }
  }

  /** Add a member to the shared waiting queue and try to make a match. */
  private async enqueue(id: string) {
    const member = this.members.get(id);
    if (!member) return;

    if (member.partnerId) await this.breakPair(id, true);
    if (member.status === 'waiting') return;

    member.status = 'waiting';
    // Sorted set keyed by enqueue time → FIFO ordering, set semantics (no dupes).
    await redis.zadd(KEYS.queue, { score: Date.now(), member: id });

    const queueSize = await redis.zcard(KEYS.queue);
    log.info('queue', 'person started matching', {
      id: shortId(id),
      waiting: queueSize,
    });

    this.send(member.socket, { type: 'waiting' });
    await this.tryMatch();
  }

  /**
   * Pop waiting members from the shared queue and pair valid local ones.
   * Serialized via `this.matching` so concurrent calls don't race.
   */
  private async tryMatch() {
    if (this.matching) return;
    this.matching = true;
    try {
      const picked: string[] = [];

      while (true) {
        // Atomically pop the oldest waiting member from the shared queue.
        const res = (await redis.zpopmin(KEYS.queue, 1)) as Array<
          string | number
        >;
        if (!res || res.length === 0) break; // queue empty
        const candidateId = String(res[0]);

        const candidate = this.members.get(candidateId);
        const usable =
          candidate &&
          candidate.status === 'waiting' &&
          candidate.socket.readyState === WebSocket.OPEN;

        // Skip stale/foreign/disconnected ids (don't requeue — they're gone).
        if (!usable) continue;

        picked.push(candidateId);

        if (picked.length === 2) {
          this.pair(picked[0]!, picked[1]!);
          picked.length = 0;
        }
      }

      // One valid member left without a partner — put it back in the queue.
      if (picked.length === 1) {
        await redis.zadd(KEYS.queue, { score: Date.now(), member: picked[0]! });
      }
    } finally {
      this.matching = false;
    }
  }

  private pair(id1: string, id2: string) {
    const user1 = this.members.get(id1);
    const user2 = this.members.get(id2);
    if (!user1 || !user2) return;

    user1.partnerId = id2;
    user2.partnerId = id1;
    user1.status = 'matched';
    user2.status = 'matched';

    log.info('match', 'paired two developers', {
      a: shortId(id1),
      b: shortId(id2),
    });

    // user1 is the initiator and creates the WebRTC offer.
    this.send(user1.socket, { type: 'matched', partnerId: id2, initiator: true });
    this.send(user2.socket, { type: 'matched', partnerId: id1, initiator: false });
  }

  /** Forward a signaling payload to the current partner (same instance). */
  private relaySignal(fromId: string, signal: unknown) {
    const member = this.members.get(fromId);
    if (!member || !member.partnerId) return;

    const partner = this.members.get(member.partnerId);
    if (!partner || partner.socket.readyState !== WebSocket.OPEN) return;

    this.send(partner.socket, { type: 'signal', signal });
  }

  /** "Next": leave the current match and re-enter the queue. */
  private async next(id: string) {
    const member = this.members.get(id);
    if (!member) return;
    log.info('flow', 'person clicked next', { id: shortId(id) });
    await this.breakPair(id, true);
    await this.enqueue(id);
  }

  /** "Stop": leave the match/queue and go idle. */
  private async stop(id: string) {
    const member = this.members.get(id);
    if (!member) return;
    log.info('flow', 'person stopped matching', { id: shortId(id) });
    await this.breakPair(id, true);
    await redis.zrem(KEYS.queue, id);
    member.status = 'idle';
    this.send(member.socket, { type: 'stopped' });
  }

  /**
   * Break the pairing for `id`. Notifies the partner and optionally requeues
   * them so they get matched with someone new.
   */
  private async breakPair(id: string, requeuePartner: boolean) {
    const member = this.members.get(id);
    if (!member || !member.partnerId) return;

    const partner = this.members.get(member.partnerId);
    member.partnerId = null;

    if (!partner) return;
    partner.partnerId = null;

    const partnerOpen = partner.socket.readyState === WebSocket.OPEN;
    if (partnerOpen) this.send(partner.socket, { type: 'partner-left' });

    if (requeuePartner && partnerOpen) {
      partner.status = 'waiting';
      await redis.zadd(KEYS.queue, { score: Date.now(), member: partner.id });
      this.send(partner.socket, { type: 'waiting' });
      await this.tryMatch();
    } else {
      partner.status = 'idle';
    }
  }

  private async handleDisconnect(id: string) {
    const member = this.members.get(id);
    if (!member) return;

    try {
      await this.breakPair(id, true);
      await this.cleanupSharedState(id);
    } catch (err) {
      log.error('disconnect', 'cleanup error', { id: shortId(id), err: String(err) });
    } finally {
      this.members.delete(id);
      const online = await this.broadcastOnlineCount().catch(() => undefined);
      log.info('disconnect', 'person left', {
        id: shortId(id),
        sockets: this.members.size,
        online: online ?? '?',
      });
      await this.tryMatch().catch(() => {});
    }
  }

  /** Remove a member from the shared queue + presence. */
  private async cleanupSharedState(id: string) {
    await Promise.all([
      redis.zrem(KEYS.queue, id),
      redis.zrem(KEYS.online, id),
    ]);
  }

  /** Mark a member as recently seen (presence). */
  private async touchPresence(id: string) {
    await redis.zadd(KEYS.online, { score: Date.now(), member: id });
  }

  /** Count members seen within the presence window (auto-prunes ghosts). */
  private async broadcastOnlineCount(): Promise<number> {
    const cutoff = Date.now() - ONLINE_WINDOW_MS;
    // Drop anyone not seen recently, then count the rest.
    await redis.zremrangebyscore(KEYS.online, 0, cutoff);
    const count = await redis.zcard(KEYS.online);
    this.broadcast({ type: 'online', count });
    return count;
  }

  /** Native ws heartbeat: ping clients, terminate dead ones, refresh presence. */
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      void this.runHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);
  }

  private async runHeartbeat() {
    const now = Date.now();
    const presenceUpdates: Promise<unknown>[] = [];
    let terminated = 0;

    this.members.forEach((member) => {
      if (!member.isAlive) {
        // Missed the previous ping — assume dead and drop it.
        member.socket.terminate();
        terminated++;
        return;
      }
      member.isAlive = false;
      try {
        member.socket.ping();
      } catch {
        member.socket.terminate();
        terminated++;
        return;
      }
      presenceUpdates.push(
        redis.zadd(KEYS.online, { score: now, member: member.id })
      );
    });

    try {
      await Promise.allSettled(presenceUpdates);
      const online = await this.broadcastOnlineCount();
      log.info('heartbeat', 'pulse', {
        sockets: this.members.size,
        online,
        ...(terminated ? { droppedDead: terminated } : {}),
      });
    } catch (err) {
      log.error('heartbeat', 'error', { err: String(err) });
    }
  }

  private send(socket: WebSocket, payload: unknown) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  }

  broadcast(payload: unknown) {
    const data = JSON.stringify(payload);
    this.members.forEach(({ socket }) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(data);
    });
  }
}
