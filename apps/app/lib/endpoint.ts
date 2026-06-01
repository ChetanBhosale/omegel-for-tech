import FrontendSecrets from "@repo/secrets/frontend";

function normalizeBaseUrl(raw: string | undefined): string {
  const fallback = "http://localhost:4000";
  if (!raw) return fallback;
  const first = raw.trim().split(/\s+/)[0] ?? "";
  return first.replace(/\/+$/, "") || fallback;
}

export const API_BASE_URL = normalizeBaseUrl(FrontendSecrets.PUBLIC_BACKEND);

export const ENDPOINTS = {
  auth: {
    me: "/api/auth/me",
    logout: "/api/auth/logout",
    github: "/api/auth/github",
    google: "/api/auth/google",
  },
} as const;

export function apiUrl(path: string): string {
  const cleanPath = `/${path.replace(/^\/+/, "")}`;
  return `${API_BASE_URL}${cleanPath}`;
}
