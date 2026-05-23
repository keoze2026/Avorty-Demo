/**
 * Compact KPI tile — used in dashboard headers and hero mock-ups.
 * Renders an icon, big mono value, and a label with optional delta.
 */

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  /** Percent change vs previous period; positive renders green, negative red */
  delta?: number;
  /** Override the icon-tile color (Tailwind class). */
  accentClass?: string;
  className?: string;
}

export function StatTile({
  icon: Icon,
  value,
  label,
  delta,
  accentClass = "bg-accent/10 text-accent",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/40 bg-card p-3",
        className,
      )}
    >
      <div className={cn("rounded-lg p-2 shrink-0", accentClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-lg font-bold">{value}</span>
          {typeof delta === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs",
                delta >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-destructive",
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {delta >= 0 ? "+" : ""}
              {delta}%
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}
