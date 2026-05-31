"use client";

import { GlassButton } from "@/components/ui/glass-button";
import { GithubIcon } from "@/components/icons";
import { DISPLAY_FONT } from "@/lib/fonts";

/** Landing page hero: headline, subtext, and the primary CTA. */
export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative z-10 flex flex-col items-center px-6 py-[90px] pt-32 pb-40 text-center">
      <h1
        className="animate-fade-rise max-w-7xl text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
        style={DISPLAY_FONT}
      >
        Meet Tech People{" "}
        <em className="not-italic text-muted-foreground">at random.</em>
      </h1>

      <p className="animate-fade-rise-delay mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        No more creepy uncles ruining every random video call.
      </p>

      <GlassButton
        size="lg"
        onClick={onStart}
        className="animate-fade-rise-delay-2 mt-12 h-15 px-14 text-lg"
      >
        <GithubIcon className="size-5" />
        Start Matching
      </GlassButton>
    </section>
  );
}
