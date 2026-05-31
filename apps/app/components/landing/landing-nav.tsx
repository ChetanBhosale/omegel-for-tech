import { Logo } from "@/components/brand/logo";
import { StartButton } from "@/components/landing/start-button";

/** Landing page top nav: centered logo on mobile, CTA on desktop. */
export function LandingNav() {
  return (
    <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
      <Logo className="flex-1 text-center text-3xl md:flex-none md:text-left" />
      <StartButton className="hidden md:inline-flex" />
    </nav>
  );
}
