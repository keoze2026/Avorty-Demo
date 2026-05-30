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

/* ─── Sparkline aggregation helpers ──────────────────────────────────── */

/**
 * Token sparklines are normalized to roughly the same length. We blend them
 * into a single market-wide series by sampling each point at the same index
 * and weighting by `weight(token)`.
 */
function aggregateSparkline(
  tokens: TokenEntry[],
  weight: (t: TokenEntry) => number,
): number[] {
  const len = Math.max(...tokens.map((t) => t.sparkline.length), 0);
  if (len === 0) return [];
  const out: number[] = new Array(len).fill(0);
  let totalW = 0;
  for (const t of tokens) {
    const w = weight(t);
    if (w <= 0 || t.sparkline.length === 0) continue;
    totalW += w;
    // Resample by index. The sparklines aren't all the same length so map
    // proportionally onto the common axis.
    for (let i = 0; i < len; i++) {
      const src = Math.floor((i / len) * t.sparkline.length);
      out[i] += w * t.sparkline[src];
    }
  }
  if (totalW === 0) return out;
  for (let i = 0; i < len; i++) out[i] /= totalW;
  return out;
}

/**
 * Derive a BTC-dominance time series from the BTC sparkline vs the
 * marketcap-weighted aggregate sparkline. Both series are indices into their
 * respective per-token movement curves, so taking the ratio gives a stable
 * proxy for how dominance has moved relative to the rest of the market.
 */
function dominanceSparkline(
  tokens: TokenEntry[],
  btcMcap: number,
  totalMcap: number,
): number[] {
  if (totalMcap === 0) return [];
  const btc = tokens.find((t) => t.symbol === "BTC");
  if (!btc) return [];
  const market = aggregateSparkline(tokens, (t) => t.marketCap);
  const len = Math.min(btc.sparkline.length, market.length);
  const out: number[] = new Array(len);
  const baseDom = (btcMcap / totalMcap) * 100;
  // Re-base each side to its mid-point so the ratio collapses to a small
  // wiggle around `baseDom`. Tiny numbers stay tiny — the y-axis of an
  // SVG sparkline normalizes to min/max automatically.
  const btcMid = btc.sparkline.reduce((a, b) => a + b, 0) / btc.sparkline.length;
  const mktMid = market.reduce((a, b) => a + b, 0) / market.length;
  if (btcMid === 0 || mktMid === 0) return [];
  for (let i = 0; i < len; i++) {
    const ratio = (btc.sparkline[i] / btcMid) / (market[i] / mktMid);
    out[i] = baseDom * ratio;
  }
  return out;
}

/** Stable count-trend line for "Active Tokens" — deterministic, grows slowly. */
function countSparkline(count: number): number[] {
  const len = 32;
  const out: number[] = new Array(len);
  // Slow upward drift across the window plus tiny per-index wiggle.
  for (let i = 0; i < len; i++) {
    const drift = count * (0.985 + (i / (len - 1)) * 0.015);
    const wiggle = Math.sin(i * 0.6) * count * 0.002;
    out[i] = drift + wiggle;
  }
  return out;
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
      btcMcap,
    };
  }, [tokens]);

  // Per-card sparklines, derived once from the live token set.
  const sparks = React.useMemo(() => {
    return {
      mcap: aggregateSparkline(tokens, (t) => t.marketCap),
      volume: aggregateSparkline(tokens, (t) => t.volume24h),
      dominance: dominanceSparkline(tokens, stats.btcMcap, stats.totalMcap),
      count: countSparkline(stats.assetCount),
    };
  }, [tokens, stats.btcMcap, stats.totalMcap, stats.assetCount]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={Wallet}
        label="Market Cap"
        value={formatCompactCurrency(stats.totalMcap)}
        trend={stats.change24h}
        sparkline={sparks.mcap}
      />
      <StatCard
        icon={BarChart3}
        label="24h Volume"
        value={formatCompactCurrency(stats.totalVolume)}
        sparkline={sparks.volume}
      />
      <StatCard
        icon={Crown}
        label="BTC Dominance"
        value={formatPercent(stats.dominance, 1)}
        sparkline={sparks.dominance}
      />
      <StatCard
        icon={Coins}
        label="Active Tokens"
        value={formatNumber(stats.assetCount)}
        sparkline={sparks.count}
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
  sparkline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  /** Optional % delta — rendered as ↑/↓ pill above the value. */
  trend?: number;
  /** Series for the right-side mini-line chart. */
  sparkline?: number[];
}) {
  const positive = (trend ?? 0) >= 0;
  // Sparkline trend = compare first to last point so colour matches reality
  // even when no explicit `trend` is passed in.
  const sparkPositive =
    sparkline && sparkline.length > 1
      ? sparkline[sparkline.length - 1] >= sparkline[0]
      : positive;

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
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
            {value}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
        </div>
        {sparkline && sparkline.length > 1 && (
          <Sparkline points={sparkline} positive={sparkPositive} />
        )}
      </div>
    </Card>
  );
}

/* ─── Inline SVG sparkline ───────────────────────────────────────────── */

function Sparkline({
  points,
  positive,
  width = 120,
  height = 36,
}: {
  points: number[];
  positive: boolean;
  width?: number;
  height?: number;
}) {
  // Normalize to fit the box, leaving a tiny margin so the stroke doesn't
  // clip at the top/bottom of the viewport.
  const padY = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = points.length > 1 ? width / (points.length - 1) : 0;

  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = padY + (1 - (p - min) / range) * (height - padY * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  // Same green-vs-red ramp used by the token-table sparklines.
  const stroke = positive
    ? "oklch(0.62 0.18 155)"
    : "oklch(0.62 0.21 22)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-hidden
      className="shrink-0"
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
