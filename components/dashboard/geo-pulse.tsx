/**
 * GeoPulse — geographic distribution rendered as a hex-coded grid.
 * Each state card is a small instrument tile with its own micro-bar.
 */

"use client";

import { motion } from "framer-motion";

import { BracketCard } from "@/components/shared/bracket-card";
import { SectionLabel } from "@/components/shared/section-label";
import { formatCurrency, formatNumber } from "@/lib/format";
import { GEO_DISTRIBUTION } from "@/lib/mock/timeseries";
import { cn } from "@/lib/utils";

export function GeoPulse() {
  const max = Math.max(...GEO_DISTRIBUTION.map((g) => g.calls), 1);
  const total = GEO_DISTRIBUTION.reduce((s, g) => s + g.calls, 0);

  return (
    <BracketCard>
      <SectionLabel
        index={2}
        title="Geo pulse"
        meta={`${formatNumber(total)} calls`}
      />

      <div className="grid grid-cols-2 gap-2">
        {GEO_DISTRIBUTION.map((g, i) => {
          const pct = (g.calls / max) * 100;
          return (
            <motion.div
              key={g.state}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.32 }}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-border bg-secondary/30 px-3 py-2.5",
              )}
            >
              {/* fill rail */}
              <motion.div
                aria-hidden
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.04 * i + 0.1, duration: 0.7, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-accent/8"
              />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-accent/30 bg-accent/10 font-mono text-[10px] font-bold tracking-wider text-accent">
                    {g.state}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs">{g.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {formatCurrency(g.revenue)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold tabular-nums">
                    {formatNumber(g.calls)}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    calls
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer rank rail */}
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>6 states · top 80%</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-count-tick" />
          live
        </span>
      </div>
    </BracketCard>
  );
}
