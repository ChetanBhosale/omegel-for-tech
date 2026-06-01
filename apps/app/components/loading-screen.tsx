import { Logo } from "@/components/brand/logo";
import { DISPLAY_FONT } from "@/lib/fonts";

export function LoadingScreen({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dremy.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-background/70 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <Logo className="text-3xl sm:text-4xl" />

        <div className="relative flex size-16 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/10" />
          <span className="absolute size-full animate-spin rounded-full border-2 border-foreground/15 border-t-foreground/80" />
          <span className="size-2.5 rounded-full bg-foreground/80" />
        </div>

        <p
          className="animate-pulse text-lg text-muted-foreground"
          style={DISPLAY_FONT}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
