import FrontendSecrets from "@repo/secrets/frontend";

/** Base URL of the backend API (e.g. http://localhost:4000). */
export const API_BASE_URL =
  FrontendSecrets.PUBLIC_BACKEND ?? "http://localhost:4000";

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
  return `${API_BASE_URL}${path}`;
}
