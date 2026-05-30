"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useMatch } from "./useMatch";

export default function MatchClient() {
  const {
    status,
    onlineCount,
    localVideoRef,
    remoteVideoRef,
    start,
    stop,
    next,
  } = useMatch();

  const statusLabel: Record<typeof status, string> = {
    connecting: "Connecting to server...",
    idle: "Ready when you are.",
    waiting: "Looking for a match...",
    matched: "Connected! Say hi 👋",
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Nav */}
      <nav className="flex w-full items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold tracking-tight">OmegelTech</h1>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-green-500" />
            {onlineCount} online
          </span>
          <UserButton />
        </div>
      </nav>

      {/* Video area */}
      <main className="flex flex-1 flex-col items-center gap-6 p-6">
        <p className="text-sm text-muted-foreground">{statusLabel[status]}</p>

        <div className="grid w-full max-w-4xl flex-1 gap-4 md:grid-cols-2">
          {/* Remote */}
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {status !== "matched" && (
              <span className="absolute text-sm text-muted-foreground">
                Stranger
              </span>
            )}
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              Stranger
            </span>
          </div>

          {/* Local */}
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              You
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {status === "idle" || status === "connecting" ? (
            <Button
              size="lg"
              onClick={start}
              disabled={status === "connecting"}
            >
              Start Matching
            </Button>
          ) : (
            <>
              <Button size="lg" variant="outline" onClick={next}>
                Next
              </Button>
              <Button size="lg" variant="destructive" onClick={stop}>
                Stop
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
