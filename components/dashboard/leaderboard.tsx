/**
 * Leaderboard — top campaigns by revenue rendered as a numbered podium.
 * Cleaner / more geometric replacement for the boxed TopCampaignsTable.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { BracketCard } from "@/components/shared/bracket-card";
import { SectionLabel } from "@/components/shared/section-label";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/format";
import { topCampaignsByRevenue } from "@/lib/mock/timeseries";
import { cn } from "@/lib/utils";

const statusVariant = {
  active: "success",
  paused: "warning",
  draft: "outline",
  archived: "outline",
} as const;

export function Leaderboard() {
  const items = topCampaignsByRevenue(6);
  const max = Math.max(...items.map((i) => i.revenueToday), 1);

  return (
    <BracketCard>
      <SectionLabel
        index={4}
        title="Top performers"
        meta="by revenue today"
        action={{ href: ROUTES.campaigns, label: "view all" }}
      />

      <ol className="space-y-1.5">
        {items.map((c, i) => {
          const pct = Math.round((c.revenueToday / max) * 100);
          const rank = (i + 1).toString().padStart(2, "0");
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
              className="group relative overflow-hidden rounded-lg border border-border bg-secondary/20"
            >
              {/* fill rail */}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-accent/12 to-transparent",
                  i === 0 && "from-accent/22",
                )}
                style={{ width: `${pct}%` }}
              />
              <Link
                href={`${ROUTES.campaigns}/${c.id}`}
                className="relative flex items-center gap-3 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold tracking-wider",
                    i === 0
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium transition-colors group-hover:text-accent">
                      {c.name}
                    </span>
                    <Badge variant={statusVariant[c.status]} className="capitalize">
                      {c.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    <span>{c.vertical}</span>
                    <span aria-hidden>·</span>
                    <span>{formatNumber(c.callsToday)} calls</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold tabular-nums">
                    {formatCurrency(c.revenueToday)}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {pct}% peak
                  </div>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </BracketCard>
  );
}
