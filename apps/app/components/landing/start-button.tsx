"use client";

import { GlassButton } from "@/components/ui/glass-button";
import { GithubIcon } from "@/components/icons";
import { useStartMatching } from "@/hooks/use-start-matching";
import { cn } from "@/lib/utils";

/**
 * Self-contained client island for the primary CTA. Lets the surrounding
 * landing page stay a server component (so all the copy is server rendered
 * and indexable) while the button keeps its auth behaviour.
 */
export function StartButton({
  className,
  size = "md",
  iconSize = "size-4",
  label = "Start Matching",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  iconSize?: string;
  label?: string;
}) {
  const startMatching = useStartMatching();

  return (
    <GlassButton size={size} onClick={startMatching} className={className}>
      <GithubIcon className={cn(iconSize)} />
      {label}
    </GlassButton>
  );
}
