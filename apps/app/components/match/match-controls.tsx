"use client";

import type { MatchStatus } from "@/context/webrtc-context";
import { GlassButton } from "@/components/ui/glass-button";
import { SkipIcon, StopIcon } from "@/components/icons";
import { trackEvent } from "@/lib/analytics";

interface MatchControlsProps {
  status: MatchStatus;
  onStart: () => void;
  onNext: () => void;
  onStop: () => void;
}

export function MatchControls({
  status,
  onStart,
  onNext,
  onStop,
}: MatchControlsProps) {
  const isActive = status === "waiting" || status === "matched";

  const handleStart = () => {
    trackEvent("Start Matching Clicked", { source: "match_controls" });
    onStart();
  };

  const handleNext = () => {
    trackEvent("Next Clicked");
    onNext();
  };

  const handleStop = () => {
    trackEvent("Stop Clicked");
    onStop();
  };

  if (!isActive) {
    return (
      <div className="flex items-center justify-center pb-2">
        <GlassButton
          size="lg"
          className="px-14"
          onClick={handleStart}
          disabled={status === "connecting"}
        >
          {status === "connecting" ? "Connecting…" : "Start Matching"}
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 pb-2">
      <GlassButton size="lg" className="min-w-[150px]" onClick={handleNext}>
        <SkipIcon className="size-4" />
        Next
      </GlassButton>
      <GlassButton
        size="lg"
        onClick={handleStop}
        className="min-w-[150px] bg-destructive/85 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] hover:bg-destructive"
      >
        <StopIcon className="size-3.5" />
        Stop
      </GlassButton>
    </div>
  );
}
