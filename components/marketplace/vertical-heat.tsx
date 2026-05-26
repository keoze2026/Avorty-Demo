"use client";

/**
 * Single-row horizontal stacked bar showing share of recent bid volume per vertical.
 * Each segment grows/shrinks live as the tape changes.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VERTICAL_PALETTE } from "@/lib/mock/marketplace";
import { useMarketplaceStore } from "@/lib/store/marketplace-store";
import { formatPercent } from "@/lib/format";
import type { VerticalKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER: VerticalKey[] = ["Health", "Solar", "Legal", "Auto", "Finance", "Home"];

export function VerticalHeat() {
  const ticker = useMarketplaceStore((s) => s.ticker);
  const listings = useMarketplaceStore((s) => s.listings);

  const distribution = useMemo(() => {
    const verticalById = new Map<string, VerticalKey>();
    for (const l of listings) verticalById.set(l.id, l.vertical);

    const counts: Record<VerticalKey, number> = {
      Health: 0, Solar: 0, Legal: 0, Auto: 0, Finance: 0, Home: 0,
    };
    for (const b of ticker.slice(0, 50)) {
      const v = verticalById.get(b.listingId);
      if (v) counts[v] += 1;
    }
    const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
    return ORDER.map((v) => ({ v, count: counts[v], pct: (counts[v] / total) * 100 }));
  }, [ticker, listings]);

  const hottest = [...distribution].sort((a, b) => b.count - a.count)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-accent" />
          Vertical heat
          {hottest && hottest.count > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              hottest · <span className="text-foreground">{hottest.v}</span>
            </span>
          )}
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">Share of the last 50 bids by vertical</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stacked bar */}
        <div className="flex h-3 overflow-hidden rounded-full border border-border/60">
          {distribution.map(({ v, pct }) => {
            const palette = VERTICAL_PALETTE[v];
            return (
              <motion.div
                key={v}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                title={`${v} — ${pct.toFixed(0)}%`}
                style={{ background: palette.line, minWidth: pct > 0 ? 3 : 0 }}
                className="h-full"
              />
            );
          })}
        </div>

        {/* Legend / per-vertical chips */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {distribution.map(({ v, count, pct }) => {
            const palette = VERTICAL_PALETTE[v];
            const isHot = hottest?.v === v && count > 0;
            return (
              <div
                key={v}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-[11px] transition-colors",
                  isHot
                    ? `${palette.chip} ring-1 ring-current/30`
                    : "border-border/60 bg-secondary/20 text-muted-foreground",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", palette.dot)} />
                  <span className={cn("font-mono", isHot && "text-foreground")}>{v}</span>
                </span>
                <span className="font-mono">
                  {count > 0 ? formatPercent(pct, 0) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
