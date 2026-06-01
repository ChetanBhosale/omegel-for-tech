"use client";

import { GlassButton } from "@/components/ui/glass-button";
import { GithubIcon } from "@/components/icons";
import { useStartMatching } from "@/hooks/use-start-matching";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

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

  const handleClick = () => {
    trackEvent("Start Matching Clicked", { source: "cta_button" });
    startMatching();
  };

  return (
    <GlassButton size={size} onClick={handleClick} className={className}>
      <GithubIcon className={cn(iconSize)} />
      {label}
    </GlassButton>
  );
}
