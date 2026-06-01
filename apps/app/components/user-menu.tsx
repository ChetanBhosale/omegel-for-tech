"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useLogout } from "@/hooks/use-auth";
import { trackEvent } from "@/lib/analytics";

export function UserMenu() {
  const { user } = useUser();
  const logout = useLogout();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    trackEvent("Logout Clicked");
    await logout.mutateAsync();
    router.push("/");
  };

  const initial = (user.username ?? user.name ?? "?").slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="liquid-glass flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-transform hover:scale-[1.05]">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username ?? "User"}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-foreground">
              {initial}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {user.name ?? user.username ?? "Developer"}
          </span>
          {user.email && (
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="size-4" />
          {logout.isPending ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
