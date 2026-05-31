import { DISPLAY_FONT } from "@/lib/fonts";

const FEATURES = [
  {
    title: "Developers only",
    body: "Everyone signs in with GitHub before they get in. The room stays full of people who write code, not random strangers off the open internet.",
  },
  {
    title: "Matched in seconds",
    body: "Hit start and you are paired with another developer almost instantly. No lobbies, no waiting room, no forms to fill out first.",
  },
  {
    title: "Skip anytime",
    body: "Not feeling the conversation? One click moves you to the next person. The cost of moving on is zero, so you keep going until it clicks.",
  },
  {
    title: "Peer to peer video",
    body: "Calls run directly between you and your match over WebRTC. We do not record them and we do not sit in the middle of your stream.",
  },
  {
    title: "Nothing to install",
    body: "It is a website. Allow your camera and microphone once and you are live. Works in any modern browser on desktop.",
  },
  {
    title: "Free to use",
    body: "No paywall, no trial timer, no credit card. Sign in and start talking to other builders right away.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24"
    >
      <h2
        className="text-center text-4xl text-foreground sm:text-5xl"
        style={DISPLAY_FONT}
      >
        Built for people who ship
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        The random chat format you remember, rebuilt so the person on the other
        side is always another developer.
      </p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-medium text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
