import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';

type MemberStatus = 'idle' | 'waiting' | 'matched';

interface Member {
  id: string;
  socket: WebSocket;
  partnerId: string | null;
  status: MemberStatus;
}

/**
 * Singleton manager that owns the WebSocket server, the matching queue,
 * and relays WebRTC signaling messages between paired peers.
 */
export class MemberManager {
  private static instance: MemberManager;

  private wss: WebSocketServer | null = null;
  private members: Map<string, Member> = new Map();
  private queue: string[] = [];

  private constructor() {}

  static getInstance(): MemberManager {
    if (!MemberManager.instance) {
      MemberManager.instance = new MemberManager();
    }
    return MemberManager.instance;
  }

  init(port: number = 4001) {
    if (this.wss) {
      console.log('WebSocket server already running');
      return;
    }

    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (socket: WebSocket) => {
      const id = randomUUID();
      const member: Member = { id, socket, partnerId: null, status: 'idle' };
      this.members.set(id, member);

      console.log(`[connect] ${id} — online: ${this.members.size}`);

      this.send(socket, { type: 'connected', id });
      this.broadcastOnlineCount();

      socket.on('message', (raw) => {
        let msg: any;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }
        this.handleMessage(id, msg);
      });

      socket.on('close', () => {
        this.handleDisconnect(id);
      });

      socket.on('error', (err) => {
        console.error(`[error] ${id}:`, err.message);
        this.handleDisconnect(id);
      });
    });

    console.log(`WebSocket server running on ws://localhost:${port}`);
  }

  private handleMessage(id: string, msg: any) {
    const member = this.members.get(id);
    if (!member) return;

    switch (msg.type) {
      case 'start':
        this.enqueue(id);
        break;

      case 'stop':
        this.stop(id);
        break;

      case 'next':
        this.next(id);
        break;

      case 'signal':
        // Relay WebRTC signaling (offer / answer / ICE candidate) to the partner.
        this.relaySignal(id, msg.signal);
        break;

      default:
        break;
    }
  }

  /** Add a member to the waiting queue and try to make a match. */
  private enqueue(id: string) {
    const member = this.members.get(id);
    if (!member) return;

    // Break any existing pairing first.
    if (member.partnerId) this.breakPair(id, true);

    if (member.status === 'waiting') return; // already queued

    member.status = 'waiting';
    if (!this.queue.includes(id)) this.queue.push(id);

    this.send(member.socket, { type: 'waiting' });
    this.tryMatch();
  }

  /** Pop two valid waiting members and pair them. */
  private tryMatch() {
    while (this.queue.length >= 2) {
      const id1 = this.queue.shift()!;
      const user1 = this.members.get(id1);
      if (!user1 || user1.status !== 'waiting') continue;

      const id2 = this.queue.shift()!;
      const user2 = this.members.get(id2);
      if (!user2 || user2.status !== 'waiting') {
        // user2 invalid — put user1 back at the front and stop.
        this.queue.unshift(id1);
        continue;
      }

      // Pair them up.
      user1.partnerId = id2;
      user2.partnerId = id1;
      user1.status = 'matched';
      user2.status = 'matched';

      console.log(`[match] ${id1} <-> ${id2}`);

      // user1 is the initiator and creates the WebRTC offer.
      this.send(user1.socket, { type: 'matched', partnerId: id2, initiator: true });
      this.send(user2.socket, { type: 'matched', partnerId: id1, initiator: false });
    }
  }

  /** Forward a signaling payload to the current partner. */
  private relaySignal(fromId: string, signal: unknown) {
    const member = this.members.get(fromId);
    if (!member || !member.partnerId) return;

    const partner = this.members.get(member.partnerId);
    if (!partner || partner.socket.readyState !== WebSocket.OPEN) return;

    this.send(partner.socket, { type: 'signal', signal });
  }

  /** "Next": leave the current match and re-enter the queue. */
  private next(id: string) {
    const member = this.members.get(id);
    if (!member) return;

    this.breakPair(id, true);
    this.enqueue(id);
  }

  /** "Stop": leave the match/queue and go idle. */
  private stop(id: string) {
    const member = this.members.get(id);
    if (!member) return;

    this.breakPair(id, true);
    this.removeFromQueue(id);
    member.status = 'idle';
    this.send(member.socket, { type: 'stopped' });
  }

  /**
   * Break the pairing for `id`. Notifies the partner and, if `requeuePartner`
   * is true, puts the partner back into the matching queue.
   */
  private breakPair(id: string, requeuePartner: boolean) {
    const member = this.members.get(id);
    if (!member || !member.partnerId) return;

    const partner = this.members.get(member.partnerId);
    member.partnerId = null;

    if (partner) {
      partner.partnerId = null;
      if (partner.socket.readyState === WebSocket.OPEN) {
        this.send(partner.socket, { type: 'partner-left' });
      }
      if (requeuePartner && partner.socket.readyState === WebSocket.OPEN) {
        partner.status = 'waiting';
        if (!this.queue.includes(partner.id)) this.queue.push(partner.id);
        this.send(partner.socket, { type: 'waiting' });
      } else {
        partner.status = 'idle';
      }
    }
  }

  private handleDisconnect(id: string) {
    const member = this.members.get(id);
    if (!member) return;

    this.breakPair(id, true);
    this.removeFromQueue(id);
    this.members.delete(id);

    console.log(`[disconnect] ${id} — online: ${this.members.size}`);

    this.broadcastOnlineCount();
    this.tryMatch();
  }

  private removeFromQueue(id: string) {
    this.queue = this.queue.filter((qid) => qid !== id);
  }

  private broadcastOnlineCount() {
    const count = this.members.size;
    this.broadcast({ type: 'online', count });
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
