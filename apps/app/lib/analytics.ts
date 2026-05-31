"use client";

import { track } from "@vercel/analytics";

/**
 * Wrapper around Vercel Analytics `track` that automatically tags every custom
 * event with the page title and path it fired from. Safe to call anywhere on
 * the client; no-ops during SSR.
 */
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
