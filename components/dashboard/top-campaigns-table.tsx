"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { topCampaignsByRevenue } from "@/lib/mock/timeseries";
import { formatCurrency, formatNumber } from "@/lib/format";
import { ROUTES } from "@/lib/constants";

const statusVariant = {
  active: "success",
  paused: "warning",
  draft: "outline",
  archived: "outline",
} as const;

export function TopCampaignsTable() {
  const items = topCampaignsByRevenue(5);
  const max = Math.max(...items.map((i) => i.revenueToday), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Top campaigns</CardTitle>
        <Link
          href={ROUTES.campaigns}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((c, i) => {
          const pct = Math.round((c.revenueToday / max) * 100);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
              className="group relative overflow-hidden rounded-lg border border-border/60 bg-secondary/30 p-3"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 bg-accent/8"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    <Badge variant={statusVariant[c.status]} className="capitalize">
                      {c.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="font-mono">{c.vertical}</span>
                    <span>·</span>
                    <span className="font-mono">{formatNumber(c.callsToday)} calls</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">{formatCurrency(c.revenueToday)}</div>
                  <div className="text-[10px] text-muted-foreground">payout {formatCurrency(c.payout, true)}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
