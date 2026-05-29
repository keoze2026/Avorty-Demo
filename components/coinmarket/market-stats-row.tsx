"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, BarChart3, Coins, Crown, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  formatCompactCurrency,
  type TokenEntry,
} from "@/lib/mock/tokens";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  tokens: TokenEntry[];
}

/**
 * Aggregated market summary row shown above the token table.
 * Mirrors the CoinMarketCap "Market Cap / Volume / BTC Dominance" strip.
 */
export function MarketStatsRow({ tokens }: Props) {
  const stats = React.useMemo(() => {
    let totalMcap = 0;
    let totalVolume = 0;
    // Market-cap-weighted average 24h change so the "market" number reflects
    // the big tokens, not penny-cap moves.
    let weightedChangeSum = 0;
    let btcMcap = 0;
    for (const t of tokens) {
      totalMcap += t.marketCap;
      totalVolume += t.volume24h;
      weightedChangeSum += t.marketCap * t.change24h;
      if (t.symbol === "BTC") btcMcap = t.marketCap;
    }
    const change24h = totalMcap > 0 ? weightedChangeSum / totalMcap : 0;
    const dominance = totalMcap > 0 ? (btcMcap / totalMcap) * 100 : 0;
    return {
      totalMcap,
      change24h,
      totalVolume,
      dominance,
      assetCount: tokens.length,
    };
  }, [tokens]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={Wallet}
        label="Market Cap"
        value={formatCompactCurrency(stats.totalMcap)}
        trend={stats.change24h}
      />
      <StatCard
        icon={BarChart3}
        label="24h Volume"
        value={formatCompactCurrency(stats.totalVolume)}
      />
      <StatCard
        icon={Crown}
        label="BTC Dominance"
        value={formatPercent(stats.dominance, 1)}
      />
      <StatCard
        icon={Coins}
        label="Active Tokens"
        value={formatNumber(stats.assetCount)}
      />
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  /** Optional % delta — rendered as ↑/↓ pill below the value. */
  trend?: number;
}) {
  const positive = (trend ?? 0) >= 0;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/12 text-accent">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {typeof trend === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
              positive
                ? "bg-[oklch(0.65_0.18_155)]/15 text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {positive ? (
              <ArrowUp className="h-2.5 w-2.5" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" />
            )}
            {formatPercent(Math.abs(trend), 2)}
          </span>
        )}
      </div>
      <div className="mt-3 text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </Card>
  );
}
