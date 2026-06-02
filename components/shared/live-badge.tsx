/**
 * Pulsing "live" indicator — used in topbar, dashboard headers, monitor.
 */

"use client";

import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export function LiveBadge({ label, className }: LiveBadgeProps) {
  const { t } = useTranslation();
  const resolved = label ?? t("liveUI.badge.live");
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
      {resolved}
    </span>
  );
}
