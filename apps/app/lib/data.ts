import { MeResponseSchema, type User } from "@repo/types";
import { ENDPOINTS, apiUrl } from "./endpoint";

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
}

export async function fetchMe(): Promise<User | null> {
  try {
    const res = await apiFetch(ENDPOINTS.auth.me);

    if (res.status === 401) {
      return null;
    }
    if (!res.ok) {
      // Non-auth server errors: treat as "not signed in" rather than throwing,
      // so react-query doesn't retry infinitely on CORS/network issues.
      return null;
    }

    const json = await res.json();
    const parsed = MeResponseSchema.safeParse(json);
    if (!parsed.success) {
      return null;
    }
    return parsed.data.user;
  } catch {
    // Network error (CORS blocked, offline, etc.) — treat as not signed in.
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiFetch(ENDPOINTS.auth.logout, { method: "POST" });
}

export const queryKeys = {
  me: ["auth", "me"] as const,
};
