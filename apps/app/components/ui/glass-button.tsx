import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends React.ComponentProps<"button"> {
  /** Render as a child element (e.g. an <a> or Link) instead of a <button>. */
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes: Record<NonNullable<GlassButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-10 text-base",
};

/**
 * The shared liquid-glass button used across the app (nav CTA, hero CTA,
 * match controls). Wraps the `.liquid-glass` utility with consistent sizing,
 * hover scale, and disabled styles.
 */
export function GlassButton({
  className,
  size = "md",
  asChild = false,
  ...props
}: GlassButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      className={cn(
        "liquid-glass glass-btn inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-full font-medium whitespace-nowrap text-foreground will-change-transform hover:-translate-y-0.5 hover:scale-[1.04] active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:scale-110",
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
