"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthProviderSlug } from "@repo/types";
import { fetchMe, logout, queryKeys } from "@/lib/data";
import { ENDPOINTS, apiUrl } from "@/lib/endpoint";

/**
 * Returns the current user via React Query.
 * `user` is `null` when signed out, `undefined` while loading.
 */
export function useUser() {
  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isSignedIn: !!query.data,
    refetch: query.refetch,
  };
}

/** Logs out, then clears the cached user. */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.me, null);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

/**
 * Start an OAuth login by doing a full-page redirect to the backend.
 * This must be a real navigation (not fetch) so the provider can redirect back.
 */
export function loginWith(provider: AuthProviderSlug = "github") {
  const path =
    provider === "google" ? ENDPOINTS.auth.google : ENDPOINTS.auth.github;
  window.location.href = apiUrl(path);
}
