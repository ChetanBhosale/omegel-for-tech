/** Central SEO config. One source of truth for URLs, keywords, and copy. */

export const SITE = {
  name: "OmegleForTech",
  domain: "https://omeglefortech.com",
  tagline: "Random video chat for developers",
  // Short, human description used across metadata.
  description:
    "Meet developers at random over 1-on-1 video. Sign in with GitHub, get matched in seconds, and talk shop with real builders. No bots, no creeps, no signup forms.",
  twitter: "@omeglefortech",
  locale: "en_US",
} as const;

/**
 * Keyword targets. These reflect what people actually search for after Omegle
 * shut down, narrowed to the developer niche we own.
 */
export const KEYWORDS = [
  "omegle for developers",
  "omegle alternative",
  "omegle alternative for developers",
  "random video chat for developers",
  "talk to developers online",
  "developer networking video chat",
  "random video chat with strangers",
  "pair programming with strangers",
  "meet developers online",
  "tech random chat",
  "github verified video chat",
  "coding chat roulette",
];

/** FAQ content. Rendered visibly AND emitted as FAQPage JSON-LD. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Is OmegleForTech free to use?",
    a: "Yes. Sign in with your GitHub account and start matching right away. There is no paywall, no credit card, and no trial timer.",
  },
  {
    q: "Why do I need to sign in with GitHub?",
    a: "GitHub sign in is what keeps the room full of real developers instead of random strangers and bots. It is a one click login, and we never see your password or post anything to your account.",
  },
  {
    q: "How is this different from Omegle?",
    a: "Omegle paired you with anyone on the internet. OmegleForTech pairs you only with other signed in developers, so every conversation starts with something in common. Same instant random format, built for people who write code.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. It runs in your browser using WebRTC. Allow your camera and microphone once and you are connected. Nothing to download.",
  },
  {
    q: "Is my video private?",
    a: "Calls are peer to peer over WebRTC. Your video and audio stream directly between you and the person you match with. We do not record or store your calls.",
  },
  {
    q: "What can I do on a call?",
    a: "Trade ideas, pair on a bug, review an approach, prep for interviews, talk about the stack you are building, or just meet someone new in the field. You can skip to the next person anytime.",
  },
];

/** Build an absolute URL on the marketing domain. */
export function absoluteUrl(path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${SITE.domain}/${clean}` : SITE.domain;
}
