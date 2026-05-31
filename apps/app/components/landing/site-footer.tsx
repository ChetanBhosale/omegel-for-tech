import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SITE } from "@/lib/seo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <Logo className="text-2xl" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {SITE.tagline}. Sign in with GitHub and meet other developers over
            1-on-1 video.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Product</span>
            <Link
              href="/#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/#faq"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Learn</span>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/omegle-alternative-for-developers"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Omegle alternative
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {year} {SITE.name}. Made for developers.
      </div>
    </footer>
  );
}
