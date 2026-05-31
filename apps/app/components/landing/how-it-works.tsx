import { DISPLAY_FONT } from "@/lib/fonts";

const STEPS = [
  {
    n: "01",
    title: "Sign in with GitHub",
    body: "One click. No password for us to see, no signup form, nothing posted to your account. It is just how we keep the room full of real developers.",
  },
  {
    n: "02",
    title: "Allow your camera",
    body: "Your browser asks once. This is a video first space, so a working camera and mic are what make a real conversation possible.",
  },
  {
    n: "03",
    title: "Get matched and talk",
    body: "Press start and you are connected to another developer in seconds. Talk shop, pair on a bug, or skip to the next person whenever you like.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24"
    >
      <h2
        className="text-center text-4xl text-foreground sm:text-5xl"
        style={DISPLAY_FONT}
      >
        How it works
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        From landing page to live conversation in under a minute.
      </p>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="flex flex-col gap-3">
            <span
              className="text-5xl text-muted-foreground/60"
              style={DISPLAY_FONT}
            >
              {s.n}
            </span>
            <h3 className="text-xl font-medium text-foreground">{s.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
