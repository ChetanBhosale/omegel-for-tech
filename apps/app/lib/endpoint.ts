import FrontendSecrets from "@repo/secrets/frontend";

/**
 * Base URL of the backend API (e.g. http://localhost:4000).
 * Trim whitespace and strip a trailing slash so a slightly misconfigured env
 * value (e.g. a stray space or trailing "/") can't produce a malformed URL.
 */
function normalizeBaseUrl(raw: string | undefined): string {
  const fallback = "http://localhost:4000";
  if (!raw) return fallback;
  // Guard against a value where two URLs were accidentally merged with a space.
  const first = raw.trim().split(/\s+/)[0] ?? "";
  return first.replace(/\/+$/, "") || fallback;
}

export const API_BASE_URL = normalizeBaseUrl(FrontendSecrets.PUBLIC_BACKEND);

/**
 * All backend endpoint paths in one place. Keep these as plain strings so they
 * are easy to find and change.
 */
export const ENDPOINTS = {
  auth: {
    me: "/api/auth/me",
    logout: "/api/auth/logout",
    // OAuth start endpoints (full-page redirects, not fetch).
    github: "/api/auth/github",
    google: "/api/auth/google",
  },
} as const;

/** Build an absolute URL for a given endpoint path. */
export function apiUrl(path: string): string {
  // Ensure exactly one leading slash on the path.
  const cleanPath = `/${path.replace(/^\/+/, "")}`;
  return `${API_BASE_URL}${cleanPath}`;
}
