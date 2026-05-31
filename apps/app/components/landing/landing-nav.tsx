"use client";

import { Logo } from "@/components/brand/logo";
import { GlassButton } from "@/components/ui/glass-button";
import { GithubIcon } from "@/components/icons";

/** Landing page top nav: centered logo on mobile, CTA on desktop. */
export function LandingNav({ onStart }: { onStart: () => void }) {
  return (
    <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
      <Logo className="flex-1 text-center text-3xl md:flex-none md:text-left" />

      <GlassButton onClick={onStart} className="hidden md:inline-flex">
        <GithubIcon className="size-4" />
        Start Matching
      </GlassButton>
    </nav>
  );
}
