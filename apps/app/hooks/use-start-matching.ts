"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, loginWith } from "@/hooks/use-auth";

/**
 * Returns a handler for the primary "Start Matching" CTA:
 * - signed-in users go straight to /match
 * - signed-out users are sent through GitHub OAuth
 */
export function useStartMatching() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return useCallback(() => {
    if (isSignedIn) {
      router.push("/match");
    } else {
      loginWith("github");
    }
  }, [isSignedIn, router]);
}
