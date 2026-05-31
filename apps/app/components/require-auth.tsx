"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/loading-screen";

/**
 * Client-side route guard. Redirects to the landing page when the user is not
 * authenticated. Used to protect pages like /match.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.replace("/");
    }
  }, [isLoading, isSignedIn, router]);

  if (isLoading) {
    return <LoadingScreen message="Getting things ready…" />;
  }

  if (!isSignedIn) {
    return <LoadingScreen message="Redirecting…" />;
  }

  return <>{children}</>;
}
