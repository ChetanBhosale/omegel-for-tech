import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { StartButton } from "@/components/landing/start-button";
import { SiteFooter } from "@/components/landing/site-footer";
import { FaqSection } from "@/components/landing/faq-section";
import { AppJsonLd, FaqJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { DISPLAY_FONT } from "@/lib/fonts";
import { SITE, absoluteUrl } from "@/lib/seo";

const TITLE = "The Omegle alternative built for developers";
const DESCRIPTION =
  "Looking for an Omegle alternative that is not a free for all? OmegleForTech pairs you only with other developers over 1-on-1 video. Sign in with GitHub and start in seconds.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("omegle-alternative-for-developers"),
  },
  openGraph: {
    title: `${TITLE} — ${SITE.name}`,
    description: DESCRIPTION,
    url: absoluteUrl("omegle-alternative-for-developers"),
    type: "article",
  },
};

const SECTIONS = [
  {
    heading: "Omegle is gone. The need it filled is not.",
    paragraphs: [
      "When Omegle shut down in November 2023, it left millions of people without the one thing it did well: drop you into a conversation with someone new, instantly, with zero setup. People still search for that experience every single day.",
      "The replacements that showed up mostly copied the old model exactly, including the part that made it unusable. Open the page, point your camera at nothing, and start skipping. If you are a developer, that is not worth your time.",
    ],
  },
  {
    heading: "A room that is actually full of developers",
    paragraphs: [
      "OmegleForTech only lets you in through GitHub sign in. That single requirement changes everything about who you end up talking to. Instead of the entire internet, you get other people who write code for a living or for fun.",
      "Every match starts with shared context. The language you are learning, the framework you are fighting with, the interview you are prepping for. You skip the awkward 'so what do you do' part because you already know.",
    ],
  },
  {
    heading: "Same instant format, none of the chaos",
    paragraphs: [
      "Press start and you are connected to another developer in seconds. Want to move on? One click and you get someone new. It keeps the spontaneity that made the original fun.",
      "The difference is the floor under it. Sign in keeps out the throwaway anonymity that made old random chat a moderation nightmare, and calls run peer to peer over WebRTC so your video goes straight to your match.",
    ],
  },
  {
    heading: "What developers use it for",
    paragraphs: [
      "Pair on a bug you have been stuck on. Get a quick gut check on an architecture decision. Practice explaining your work out loud before a real interview. Meet someone building in the same corner of the industry as you. Or just talk to another human who understands what your day looks like.",
    ],
  },
];

export default function OmegleAlternativePage() {
  return (
    <>
      <AppJsonLd />
      <FaqJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE.domain },
          {
            name: "Omegle alternative for developers",
            url: absoluteUrl("omegle-alternative-for-developers"),
          },
        ]}
      />

      <main className="relative min-h-svh bg-background">
        <LandingNav />

        <article className="relative z-10 mx-auto w-full max-w-3xl px-6 py-16">
          <h1
            className="text-4xl leading-tight text-foreground sm:text-6xl"
            style={DISPLAY_FONT}
          >
            {TITLE}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {DESCRIPTION}
          </p>

          <div className="mt-10">
            <StartButton size="lg" iconSize="size-5" className="px-12 text-lg" />
          </div>

          <div className="mt-16 flex flex-col gap-12">
            {SECTIONS.map((s) => (
              <section key={s.heading}>
                <h2 className="text-2xl font-medium text-foreground">
                  {s.heading}
                </h2>
                {s.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="mt-4 text-base leading-relaxed text-muted-foreground"
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <FaqSection />
      </main>

      <SiteFooter />
    </>
  );
}
