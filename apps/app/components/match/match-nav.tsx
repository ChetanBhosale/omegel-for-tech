import type { MatchStatus } from "@/context/webrtc-context";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/user-menu";
import { OnlineBadge } from "@/components/match/online-badge";
import { DISPLAY_FONT } from "@/lib/fonts";

const STATUS_LABEL: Record<MatchStatus, string> = {
  connecting: "Connecting to server…",
  idle: "Ready when you are.",
  waiting: "Searching…",
  matched: "Connected — say hi 👋",
};

/** Top bar for the match page: logo, centered live status, online count, profile. */
export function MatchNav({
  status,
  onlineCount,
}: {
  status: MatchStatus;
  onlineCount: number;
}) {
  return (
    <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
      <Logo className="text-2xl sm:text-3xl" />

      <span
        className="absolute left-1/2 hidden -translate-x-1/2 text-xl text-muted-foreground md:block"
        style={DISPLAY_FONT}
      >
        {STATUS_LABEL[status]}
      </span>

      <div className="flex items-center gap-4">
        <OnlineBadge count={onlineCount} />
        <UserMenu />
      </div>
    </nav>
  );
}
