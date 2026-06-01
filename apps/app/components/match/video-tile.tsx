import { cn } from "@/lib/utils";

interface VideoTileProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  muted: boolean;
  mirror?: boolean;
  placeholder?: string | null;
  loading?: boolean;
}

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
