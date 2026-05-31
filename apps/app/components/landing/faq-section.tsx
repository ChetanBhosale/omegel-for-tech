import { FAQ } from "@/lib/seo";
import { DISPLAY_FONT } from "@/lib/fonts";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative z-10 mx-auto w-full max-w-3xl px-6 py-24"
    >
      <h2
        className="text-center text-4xl text-foreground sm:text-5xl"
        style={DISPLAY_FONT}
      >
        Questions, answered
      </h2>

      <div className="mt-12 divide-y divide-border">
        {FAQ.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-foreground">
              {item.q}
              <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
