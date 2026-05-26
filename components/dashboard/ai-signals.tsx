/**
 * AiSignals — vertical stack of AI recommendations.
 * Replaces the horizontal scroller for the new bento layout.
 */

"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, PauseCircle, Scale, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BracketCard } from "@/components/shared/bracket-card";
import { SectionLabel } from "@/components/shared/section-label";
import { Button } from "@/components/ui/button";
import { AI_RECOMMENDATIONS, type Recommendation } from "@/lib/mock/timeseries";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  Recommendation["kind"],
  { icon: LucideIcon; tone: string; chip: string; rail: string }
> = {
  scale: {
    icon: TrendingUp,
    tone: "text-accent",
    chip: "border-accent/40 bg-accent/10 text-accent",
    rail: "bg-accent",
  },
  pause: {
    icon: PauseCircle,
    tone: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    chip: "border-[oklch(0.6_0.16_75)]/40 bg-[oklch(0.6_0.16_75)]/10 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    rail: "bg-[oklch(0.6_0.16_75)]",
  },
  rebalance: {
    icon: Scale,
    tone: "text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
    chip: "border-[oklch(0.6_0.2_290)]/40 bg-[oklch(0.6_0.2_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
    rail: "bg-[oklch(0.6_0.2_290)]",
  },
  alert: {
    icon: AlertTriangle,
    tone: "text-destructive",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
    rail: "bg-destructive",
  },
};

export function AiSignals() {
  return (
    <BracketCard>
      <SectionLabel
        index={5}
        title="AI signals"
        meta="updated 4m ago"
        action={
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            4 active
          </span>
        }
      />

      <ul className="space-y-2">
        {AI_RECOMMENDATIONS.map((r, i) => {
          const meta = KIND_META[r.kind];
          const Icon = meta.icon;
          return (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="group relative overflow-hidden rounded-lg border border-border bg-card/60"
            >
              {/* left rail */}
              <span aria-hidden className={cn("absolute inset-y-0 left-0 w-0.5", meta.rail)} />
              <div className="flex items-start gap-3 p-3 pl-4">
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-secondary/60",
                    meta.tone,
                    "border-border",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em]",
                        meta.chip,
                      )}
                    >
                      {r.kind}
                    </span>
                    <span className={cn("font-mono text-[10px]", meta.tone)}>{r.impact}</span>
                  </div>
                  <h3 className="mt-1.5 text-xs font-semibold leading-snug">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{r.body}</p>
                </div>
              </div>
              <div className="flex items-center justify-end border-t border-border/40 px-3 py-1.5">
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]">
                  apply <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </BracketCard>
  );
}
