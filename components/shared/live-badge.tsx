/**
 * Pulsing "live" indicator — used in topbar, dashboard headers, monitor.
 */

import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export function LiveBadge({ label = "Live", className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      {label}
    </span>
  );
}
