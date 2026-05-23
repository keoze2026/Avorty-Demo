/**
 * Empty state — used for module placeholder pages.
 * Accepts a `tone` so each module reads with a slightly different color
 * accent, avoiding the "every page looks the same" trap.
 */

import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "cyan" | "emerald" | "violet" | "amber";

const TONE: Record<Tone, { icon: string; glow: string; border: string }> = {
  cyan: {
    icon: "bg-accent/10 text-accent",
    glow: "rgba(59, 182, 255, 0.18)",
    border: "border-accent/30",
  },
  emerald: {
    icon: "bg-[oklch(0.74_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
    glow: "rgba(40, 175, 110, 0.16)",
    border: "border-[oklch(0.6_0.18_155)]/25",
  },
  violet: {
    icon: "bg-[oklch(0.65_0.18_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
    glow: "rgba(150, 95, 220, 0.16)",
    border: "border-[oklch(0.6_0.2_290)]/25",
  },
  amber: {
    icon: "bg-[oklch(0.78_0.16_75)]/10 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    glow: "rgba(220, 160, 60, 0.16)",
    border: "border-[oklch(0.6_0.16_75)]/25",
  },
};

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: React.ReactNode;
  tone?: Tone;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  tone = "cyan",
  className,
}: EmptyStateProps) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-card/40 px-6 py-16 text-center",
        t.border,
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 -translate-y-1/2 blur-3xl"
        style={{ background: t.glow }}
      />
      <div
        className={cn(
          "relative mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-border",
          t.icon,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="relative font-mono text-lg font-semibold">{title}</h3>
      <p className="relative mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {actions && <div className="relative mt-6 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
