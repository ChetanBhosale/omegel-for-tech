import type { MatchStatus } from "@/context/webrtc-context";
import { GlassButton } from "@/components/ui/glass-button";
import { SkipIcon, StopIcon } from "@/components/icons";

interface MatchControlsProps {
  status: MatchStatus;
  onStart: () => void;
  onNext: () => void;
  onStop: () => void;
}

/** The bottom control bar: Start when idle, Next + Stop when matching. */
export function MatchControls({
  status,
  onStart,
  onNext,
  onStop,
}: MatchControlsProps) {
  const isActive = status === "waiting" || status === "matched";

  if (!isActive) {
    return (
      <div className="flex items-center justify-center pb-2">
        <GlassButton
          size="lg"
          className="px-14"
          onClick={onStart}
          disabled={status === "connecting"}
        >
          {status === "connecting" ? "Connecting…" : "Start Matching"}
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 pb-2">
      <GlassButton size="lg" className="min-w-[150px]" onClick={onNext}>
        <SkipIcon className="size-4" />
        Next
      </GlassButton>
      <GlassButton
        size="lg"
        onClick={onStop}
        className="min-w-[150px] bg-destructive/85 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] hover:bg-destructive"
      >
        <StopIcon className="size-3.5" />
        Stop
      </GlassButton>
    </div>
  );
}
