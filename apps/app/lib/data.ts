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

export async function logout(): Promise<void> {
  await apiFetch(ENDPOINTS.auth.logout, { method: "POST" });
}

export const queryKeys = {
  me: ["auth", "me"] as const,
};
