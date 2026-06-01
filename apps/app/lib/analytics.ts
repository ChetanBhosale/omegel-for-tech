"use client";

import { track } from "@vercel/analytics";

export function trackEvent(
  name: string,
  props: Record<string, string | number | boolean | null> = {}
) {
  if (typeof window === "undefined") return;

  track(name, {
    page: document.title,
    path: window.location.pathname,
    ...props,
  });
}
