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

export interface WebRTCContextValue {
  status: MatchStatus;
  onlineCount: number;
  /** Camera/mic permission state. "denied" blocks the experience. */
  mediaPermission: MediaPermission;
  /** True when the browser has hard-blocked camera/mic (won't re-prompt). */
  permissionBlocked: boolean;
  /** Re-request camera/mic access (used by the permission dialog). */
  requestMedia: () => void;
  /** Attach to the local <video> element (your own camera). */
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  /** Attach to the remote <video> element (the stranger). */
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  start: () => void;
  stop: () => void;
  next: () => void;
}

const WebRTCContext = createContext<WebRTCContextValue | null>(null);

// Browser WebSocket is API-compatible with the backend `ws` server.
function getWsUrl(): string {
  const raw = FrontendSecrets.PUBLIC_WS_URL ?? "http://localhost:4000";
  // Backend is plain ws, convert http(s) -> ws(s).
  return raw.replace(/^http/, "ws");
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const HEARTBEAT_INTERVAL = 25_000; // ping every 25s to keep the socket alive
const RECONNECT_DELAY = 2_000; // wait 2s before retrying a dropped connection

export function WebRTCProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MatchStatus>("connecting");
  const [onlineCount, setOnlineCount] = useState(0);
  const [mediaPermission, setMediaPermission] =
    useState<MediaPermission>("pending");
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const sendRef = useRef<(payload: unknown) => void>(() => {});

  // Acquire the local camera/mic. Idempotent — safe to call multiple times.
  // Updates `mediaPermission` so the UI can block when access is denied.
  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      // Make sure it's attached to the video element even if already acquired.
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
      // If a track ends (camera unplugged or permission revoked mid-session),
      // drop the stream and re-flag as denied so the dialog reappears.
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
      // NotAllowedError (denied), NotFoundError (no device), etc.
      console.error("getUserMedia failed", err);
      setMediaPermission("denied");

      // Detect a *hard* block (user clicked "Block") vs. a dismissed prompt.
      // When hard-blocked, the browser won't re-show its popup, so we must
      // guide the user to the address-bar settings instead.
      try {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setPermissionBlocked(result.state === "denied");
      } catch {
        // Permissions API unsupported (e.g. Safari) — assume re-prompt works.
        setPermissionBlocked(false);
      }
      return null;
    }
  }, []);

  // Tear down any active peer connection (but keep the local stream).
  const closePeer = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const createPeer = useCallback(
    async (initiator: boolean) => {
      closePeer();

      const stream = await ensureLocalStream();
      if (!stream) return null; // no camera/mic access — can't connect
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // Push local tracks to the peer.
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Remote track arrives -> render it.
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Trickle ICE candidates through the signaling channel.
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendRef.current({
            type: "signal",
            signal: { kind: "ice", candidate: event.candidate },
          });
        }
      };

      // The initiator creates and sends the offer.
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

  // Handle incoming signaling payloads.
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

  // Turn on the user's camera immediately when they land on the page —
  // independent of the WebSocket / matching state. The local stream lives for
  // the lifetime of the provider and is cleaned up on unmount.
  useEffect(() => {
    ensureLocalStream();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [ensureLocalStream]);

  // Re-request media (used by the permission dialog's "Try again" button).
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

        // Heartbeat: ping the server periodically so the connection isn't
        // dropped by idle timeouts (proxies, load balancers, etc.).
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
            break; // heartbeat ack
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
        // Connection dropped or server unreachable (e.g. cold start) —
        // show "connecting" and retry until it comes back.
        setStatus("connecting");
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        // Let onclose handle reconnection.
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

  const value: WebRTCContextValue = {
    status,
    onlineCount,
    mediaPermission,
    permissionBlocked,
    requestMedia,
    localVideoRef,
    remoteVideoRef,
    start,
    stop,
    next,
  };

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  );
}

/** Access the shared WebRTC/matching state. Must be used within a WebRTCProvider. */
export function useWebRTC(): WebRTCContextValue {
  const ctx = useContext(WebRTCContext);
  if (!ctx) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return ctx;
}
