import Link from "next/link";
import { cn } from "@/lib/utils";
import { DISPLAY_FONT } from "@/lib/fonts";

interface LogoProps {
  className?: string;
  /** Where the logo links to. Defaults to home. */
  href?: string;
}

/** The "OmegleForTech®" wordmark in the display font. */
export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("tracking-tight text-foreground", className)}
      style={DISPLAY_FONT}
    >
      OmegleForTech<sup className="text-[0.5em]">®</sup>
    </Link>
  );
}
