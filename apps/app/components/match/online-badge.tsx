/** Glass pill showing the number of people currently online, with a live pulse dot. */
export function OnlineBadge({ count }: { count: number }) {
  return (
    <span className="liquid-glass flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-foreground">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
      </span>
      {count} online
    </span>
  );
}
