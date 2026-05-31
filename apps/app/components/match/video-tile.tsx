import { cn } from "@/lib/utils";

interface VideoTileProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Mute the audio track (always true for your own tile). */
  muted: boolean;
  /** Mirror horizontally — used for your own selfie preview. */
  mirror?: boolean;
  /** Optional placeholder text shown when there's no remote stream yet. */
  placeholder?: string | null;
  /** Show an animated spinner alongside the placeholder text. */
  loading?: boolean;
}

/** A single glass-framed video feed (you or the stranger). */
export function VideoTile({
  videoRef,
  muted,
  mirror,
  placeholder,
  loading,
}: VideoTileProps) {
  return (
    <div className="liquid-glass group relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={cn("size-full object-cover", mirror && "-scale-x-100")}
      />
      {placeholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          {loading && (
            <span className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          )}
          <span className="text-sm text-muted-foreground sm:text-base">
            {placeholder}
          </span>
        </div>
      )}
    </div>
  );
}
