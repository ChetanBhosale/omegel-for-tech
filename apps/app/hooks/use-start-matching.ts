"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, loginWith } from "@/hooks/use-auth";

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
