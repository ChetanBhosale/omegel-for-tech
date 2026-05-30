"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MatchStatus = "connecting" | "idle" | "waiting" | "matched";

interface UseMatchResult {
  status: MatchStatus;
  onlineCount: number;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  start: () => void;
  stop: () => void;
  next: () => void;
}

// Browser WebSocket is API-compatible with the backend `ws` server.
function getWsUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_WS_URL ?? "http://localhost:4001";
  // Backend is plain ws, convert http(s) -> ws(s).
  return raw.replace(/^http/, "ws");
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useMatch(): UseMatchResult {
  const [status, setStatus] = useState<MatchStatus>("connecting");
  const [onlineCount, setOnlineCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const sendRef = useRef<(payload: unknown) => void>(() => {});

  // Acquire the local camera/mic once on mount.
  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
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
  const handleSignal = useCallback(
    async (signal: any) => {
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
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
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
      // Warm up the camera so it's ready when a match happens.
      ensureLocalStream().catch((err) =>
        console.error("getUserMedia failed", err)
      );
    };

    ws.onmessage = async (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
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
      if (!cancelled) setStatus("connecting");
    };

    return () => {
      cancelled = true;
      closePeer();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      ws.close();
    };
  }, [closePeer, createPeer, ensureLocalStream, handleSignal]);

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

  return {
    status,
    onlineCount,
    localVideoRef,
    remoteVideoRef,
    start,
    stop,
    next,
  };
}
