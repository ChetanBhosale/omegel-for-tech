"use client";

import { usePathname } from "next/navigation";

export function MarkdownAlternateLink() {
  const pathname = usePathname();
  if (!pathname) return null;

  let cleanPath = pathname;
  if (cleanPath.endsWith("/") && cleanPath !== "/") {
    cleanPath = cleanPath.slice(0, -1);
  }

  const twinPath = cleanPath === "/" ? "/index.md" : `${cleanPath}.md`;

  return <link rel="alternate" type="text/markdown" href={twinPath} />;
}
