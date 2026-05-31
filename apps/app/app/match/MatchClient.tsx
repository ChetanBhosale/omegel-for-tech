"use client";

import { useWebRTC } from "@/context/webrtc-context";
import { MatchNav } from "@/components/match/match-nav";
import { VideoTile } from "@/components/match/video-tile";
import { MatchControls } from "@/components/match/match-controls";
import { PermissionDialog } from "@/components/match/permission-dialog";

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

      <main className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col items-center gap-6 px-4 py-4 sm:px-6">
        {/* Video tiles */}
        <div className="grid h-[70vh] w-full grid-cols-1 gap-5 md:grid-cols-2">
          <VideoTile
            muted={false}
            videoRef={remoteVideoRef}
            placeholder={
              status === "matched"
                ? null
                : status === "waiting"
                  ? "Looking for an Real match!"
                  : "Press start matching to begin"
            }
            loading={status === "waiting"}
          />
          <VideoTile muted mirror videoRef={localVideoRef} />
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
