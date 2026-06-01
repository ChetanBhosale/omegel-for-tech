"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthProviderSlug } from "@repo/types";
import { fetchMe, logout, queryKeys } from "@/lib/data";
import { ENDPOINTS, apiUrl } from "@/lib/endpoint";

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

export function loginWith(provider: AuthProviderSlug = "github") {
  const path =
    provider === "google" ? ENDPOINTS.auth.google : ENDPOINTS.auth.github;
  window.location.href = apiUrl(path);
}
