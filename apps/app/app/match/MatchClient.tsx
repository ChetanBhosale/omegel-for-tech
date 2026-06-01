"use client";

import { useWebRTC } from "@/context/webrtc-context";
import { MatchNav } from "@/components/match/match-nav";
import { VideoTile } from "@/components/match/video-tile";
import { MatchControls } from "@/components/match/match-controls";
import { PermissionDialog } from "@/components/match/permission-dialog";
import { ChatPanel } from "@/components/match/chat-panel";

export default function MatchClient() {
  const {
    status,
    onlineCount,
    localVideoRef,
    remoteVideoRef,
    start,
    stop,
    next,
  } = useWebRTC();

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Background image + dark overlay for readability */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dremy.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-background/70 backdrop-blur-[2px]" />

      <MatchNav status={status} onlineCount={onlineCount} />

      <main className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        {/* Video + Chat layout */}
        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          {/* Video tiles (left side on desktop) */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="grid h-[60vh] w-full grid-cols-1 gap-4 md:grid-cols-2 lg:h-full">
              <VideoTile
                muted={false}
                videoRef={remoteVideoRef}
                placeholder={
                  status === "matched"
                    ? null
                    : status === "waiting"
                      ? "Looking for a real match!"
                      : "Press Start Matching to begin"
                }
                loading={status === "waiting"}
              />
              <VideoTile muted mirror videoRef={localVideoRef} />
            </div>
          </div>

          {/* Chat panel (right side on desktop, below on mobile) */}
          <div className="h-[300px] w-full shrink-0 lg:h-auto lg:w-[360px]">
            <ChatPanel />
          </div>
        </div>

        <MatchControls
          status={status}
          onStart={start}
          onNext={next}
          onStop={stop}
        />
      </main>

      {/* Blocks the experience until camera/mic permission is granted */}
      <PermissionDialog />
    </div>
  );
}
