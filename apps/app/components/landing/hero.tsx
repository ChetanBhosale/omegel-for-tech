import { StartButton } from "@/components/landing/start-button";
import { DISPLAY_FONT } from "@/lib/fonts";

/** Landing page hero: headline, subtext, and the primary CTA. */
export function Hero() {
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
        <strong>OmegleForTech</strong> is a random video chat for developers. Meet developers at random over 1-on-1 video, sign in with GitHub, get matched in seconds, and talk shop with real builders. No bots, no creeps, no signup forms.
      </p>

      <StartButton
        size="lg"
        iconSize="size-5"
        className="animate-fade-rise-delay-2 mt-12 px-14 text-lg"
      />
    </section>
  );
}
