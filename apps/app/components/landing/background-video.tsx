/** Fullscreen looping, muted background video for the landing page. */
export function BackgroundVideo({ src }: { src: string }) {
  return (
    <video
      className="absolute inset-0 z-0 h-full w-full object-cover"
      src={src}
      autoPlay
      loop
      muted
      playsInline
    />
  );
}
