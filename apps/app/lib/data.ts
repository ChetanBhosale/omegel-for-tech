import { MeResponseSchema, type User } from "@repo/types";
import { ENDPOINTS, apiUrl } from "./endpoint";

/**
 * Thin fetch wrapper that always sends cookies (the auth session lives in an
 * httpOnly cookie set by the backend) and parses JSON.
 */
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

/**
 * Fetch the currently authenticated user.
 * Returns `null` when not authenticated (backend responds 401).
 * The response is validated against the shared Zod schema from @repo/types.
 */
export async function fetchMe(): Promise<User | null> {
  const res = await apiFetch(ENDPOINTS.auth.me);

  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch user (${res.status})`);
  }

  const json = await res.json();
  const parsed = MeResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid /me response shape");
  }
  return parsed.data.user;
}

/** Log the current user out (clears the session cookie on the backend). */
export async function logout(): Promise<void> {
  await apiFetch(ENDPOINTS.auth.logout, { method: "POST" });
}

/** React Query keys, centralized to avoid typos and enable easy invalidation. */
export const queryKeys = {
  me: ["auth", "me"] as const,
};
