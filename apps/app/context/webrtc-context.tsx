"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import FrontendSecrets from "@repo/secrets/frontend";

export type MatchStatus = "connecting" | "idle" | "waiting" | "matched";

export type MediaPermission = "pending" | "granted" | "denied";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "you" | "stranger";
  timestamp: number;
}

export interface WebRTCContextValue {
  status: MatchStatus;
  onlineCount: number;
  mediaPermission: MediaPermission;
  permissionBlocked: boolean;
  requestMedia: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** P2P chat messages for the current match. Cleared on next/stop. */
  messages: ChatMessage[];
  /** Send a text message to the matched peer via DataChannel. */
  sendMessage: (text: string) => void;
  /** Whether the DataChannel is open and ready to send. */
  chatReady: boolean;
  start: () => void;
  stop: () => void;
  next: () => void;
}

const WebRTCContext = createContext<WebRTCContextValue | null>(null);

function getWsUrl(): string {
  const raw = FrontendSecrets.PUBLIC_WS_URL ?? "http://localhost:4000";
  return raw.replace(/^http/, "ws");
}

// Fallback ICE config used if the Metered fetch fails. STUN-only still
// connects most same-network and friendly-NAT calls.
const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.relay.metered.ca:80" },
];

/**
 * Fetch the full STUN + TURN ICE server list from Metered. The apiKey is
 * credential-scoped and safe for the browser. Falls back to STUN-only if the
 * request fails so calls still work on friendly networks.
 */
async function fetchIceServers(): Promise<RTCIceServer[]> {
  const base = FrontendSecrets.METERED_TURN_URL;
  const key = FrontendSecrets.METERED_API_KEY;
  if (!base || !key) return FALLBACK_ICE_SERVERS;

  try {
    const res = await fetch(`${base}?apiKey=${key}`);
    if (!res.ok) throw new Error(`Metered responded ${res.status}`);
    const servers = (await res.json()) as RTCIceServer[];
    if (!Array.isArray(servers) || servers.length === 0) {
      return FALLBACK_ICE_SERVERS;
    }
    return servers;
  } catch (err) {
    console.error("Failed to fetch TURN servers, using fallback", err);
    return FALLBACK_ICE_SERVERS;
  }
}

const HEARTBEAT_INTERVAL = 25_000;
const RECONNECT_DELAY = 2_000;

export function WebRTCProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MatchStatus>("connecting");
  const [onlineCount, setOnlineCount] = useState(0);
  const [mediaPermission, setMediaPermission] =
    useState<MediaPermission>("pending");
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  // Cached ICE servers (STUN + TURN) fetched from Metered.
  const iceServersRef = useRef<RTCIceServer[]>(FALLBACK_ICE_SERVERS);
  // P2P DataChannel for text chat.
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const sendRef = useRef<(payload: unknown) => void>(() => {});

  // Chat state (P2P, never stored in a DB).
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatReady, setChatReady] = useState(false);

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      if (localVideoRef.current && !localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      return localStreamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          localStreamRef.current = null;
          setMediaPermission("denied");
        });
      });
      setMediaPermission("granted");
      setPermissionBlocked(false);
      return stream;
    } catch (err) {
      console.error("getUserMedia failed", err);
      setMediaPermission("denied");

      try {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setPermissionBlocked(result.state === "denied");
      } catch {
        setPermissionBlocked(false);
      }
      return null;
    }
  }, []);

  const closePeer = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.ondatachannel = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    dataChannelRef.current = null;
    setChatReady(false);
    setMessages([]);
  }, []);

  const createPeer = useCallback(
    async (initiator: boolean) => {
      closePeer();

      const stream = await ensureLocalStream();
      if (!stream) return null;
      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendRef.current({
            type: "signal",
            signal: { kind: "ice", candidate: event.candidate },
          });
        }
      };

      // --- DataChannel for P2P text chat ---
      const setupChannel = (channel: RTCDataChannel) => {
        dataChannelRef.current = channel;
        channel.onopen = () => setChatReady(true);
        channel.onclose = () => setChatReady(false);
        channel.onmessage = (e) => {
          const msg: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: String(e.data),
            sender: "stranger",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, msg]);
        };
      };

      if (initiator) {
        // Initiator creates the channel before the offer.
        const channel = pc.createDataChannel("chat", { ordered: true });
        setupChannel(channel);
      } else {
        // Receiver listens for the channel from the initiator.
        pc.ondatachannel = (event) => {
          setupChannel(event.channel);
        };
      }

      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendRef.current({
          type: "signal",
          signal: { kind: "offer", sdp: offer },
        });
      }

      return pc;
    },
    [closePeer, ensureLocalStream]
  );

  const handleSignal = useCallback(async (signal: any) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (signal.kind === "offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendRef.current({
        type: "signal",
        signal: { kind: "answer", sdp: answer },
      });
    } else if (signal.kind === "answer") {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } else if (signal.kind === "ice" && signal.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      } catch (err) {
        console.error("Failed to add ICE candidate", err);
      }
    }
  }, []);

  useEffect(() => {
    ensureLocalStream();

    // Fetch STUN + TURN servers once on mount so they're ready before a match.
    fetchIceServers().then((servers) => {
      iceServersRef.current = servers;
    });

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [ensureLocalStream]);

  const requestMedia = useCallback(() => {
    setMediaPermission("pending");
    ensureLocalStream();
  }, [ensureLocalStream]);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    const clearTimers = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      heartbeatTimer = null;
      reconnectTimer = null;
    };

    const connect = () => {
      if (cancelled) return;

      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      sendRef.current = (payload: unknown) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      };

      ws.onopen = () => {
        if (cancelled) return;
        setStatus("idle");

        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = async (event) => {
        let msg: any;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        switch (msg.type) {
          case "pong":
            break;
          case "online":
            setOnlineCount(msg.count);
            break;
          case "waiting":
            closePeer();
            setStatus("waiting");
            break;
          case "matched":
            setStatus("matched");
            await createPeer(Boolean(msg.initiator));
            break;
          case "signal":
            await handleSignal(msg.signal);
            break;
          case "partner-left":
            closePeer();
            break;
          case "stopped":
            closePeer();
            setStatus("idle");
            break;
          default:
            break;
        }
      };

      ws.onclose = () => {
        clearTimers();
        closePeer();
        if (cancelled) return;
        setStatus("connecting");
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimers();
      closePeer();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [closePeer, createPeer, handleSignal]);

  const start = useCallback(() => {
    sendRef.current({ type: "start" });
  }, []);

  const stop = useCallback(() => {
    sendRef.current({ type: "stop" });
    closePeer();
    setStatus("idle");
  }, [closePeer]);

  const next = useCallback(() => {
    sendRef.current({ type: "next" });
    closePeer();
    setStatus("waiting");
  }, [closePeer]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !dataChannelRef.current) return;
    if (dataChannelRef.current.readyState !== "open") return;

    dataChannelRef.current.send(trimmed);
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed,
      sender: "you",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const value: WebRTCContextValue = {
    status,
    onlineCount,
    mediaPermission,
    permissionBlocked,
    requestMedia,
    localVideoRef,
    remoteVideoRef,
    messages,
    sendMessage,
    chatReady,
    start,
    stop,
    next,
  };

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  );
}

export function useWebRTC(): WebRTCContextValue {
  const ctx = useContext(WebRTCContext);
  if (!ctx) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return ctx;
}
