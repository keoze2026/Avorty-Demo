"use client";

/**
 * Top buyers leaderboard — sits next to Top Campaigns on the redesigned
 * dashboard. Same shape (rank, name, performance cell) as the reference
 * employee/agent tables in the client's inspiration set, but ranked by
 * revenue contributed today.
 *
 * Each row carries three color-coded performance cells:
 *
 *   ACCEPT  — accept rate (calls accepted / calls offered)
 *   CONVERT — conversion rate (completed / accepted)
 *   PACE    — utilization of daily cap
 *
 * Cells flip green / amber / red against thresholds so the operator
 * reads health at a glance, matching the reference dashboards' color
 * semantics.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Buyer, Call } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

type RangeId = "today" | "14d" | "30d";
const RANGES: Array<{ id: RangeId; days: number; label: string }> = [
  { id: "today", days: 1, label: "Today" },
  { id: "14d", days: 14, label: "14 days" },
  { id: "30d", days: 30, label: "Monthly" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

interface Row {
  id: string;
  name: string;
  organization: string;
  calls: number;
  revenue: number;
  acceptRate: number;
  conversionRate: number;
  pacePct: number;
}

interface TopBuyersLeaderboardProps {
  calls: Call[];
  buyers: Buyer[];
}

export function TopBuyersLeaderboard({ calls, buyers }: TopBuyersLeaderboardProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<RangeId>("today");

  const rows = useMemo<Row[]>(() => {
    const cutoff = (() => {
      if (range === "today") {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }
      const days = RANGES.find((r) => r.id === range)?.days ?? 1;
      return Date.now() - days * DAY_MS;
    })();

    const buyerById = new Map(buyers.map((b) => [b.id, b]));
    const agg = new Map<string, { calls: number; offered: number; converted: number; revenue: number }>();
    for (const c of calls) {
      if (c.startedAt < cutoff) continue;
      if (!c.buyerId || !buyerById.has(c.buyerId)) continue;
      const a = agg.get(c.buyerId) ?? { calls: 0, offered: 0, converted: 0, revenue: 0 };
      a.offered += 1;
      if (c.status === "completed" || c.status === "in-progress") a.calls += 1;
      if (c.status === "completed") {
        a.converted += 1;
        a.revenue += c.revenue;
      }
      agg.set(c.buyerId, a);
    }

    const out: Row[] = [];
    for (const [id, a] of agg.entries()) {
      const b = buyerById.get(id)!;
      const dailyCap = (b.dailyCap ?? 0) * (range === "today" ? 1 : range === "14d" ? 14 : 30);
      const pacePct = dailyCap > 0 ? Math.min(100, (a.offered / dailyCap) * 100) : 0;
      out.push({
        id,
        name: b.name,
        organization: b.organization ?? "",
        calls: a.calls,
        revenue: a.revenue,
        acceptRate: a.offered > 0 ? a.calls / a.offered : 0,
        conversionRate: a.calls > 0 ? a.converted / a.calls : 0,
        pacePct,
      });
    }
    return out.sort((a, b) => b.revenue - a.revenue).slice(0, 7);
  }, [calls, buyers, range]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">Top buyers</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Ranked by revenue · color shows health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div role="tablist" className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
            {RANGES.map((r) => {
              const active = range === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRange(r.id)}
                  className={cn(
                    "rounded-[5px] px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                    active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
          <Link
            href={ROUTES.buyers}
            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("common.viewAll")}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-center text-xs text-muted-foreground">
            No buyer activity in this range yet.
          </div>
        ) : (
          <ol className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/15 px-3 py-2"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 text-[10px] font-mono font-semibold text-accent">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{r.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {r.organization} · {formatCompact(r.calls)} calls · {formatCurrency(r.revenue)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <PerfCell label="Accept" value={r.acceptRate * 100} />
                  <PerfCell label="Convert" value={r.conversionRate * 100} />
                  <PerfCell label="Pace" value={r.pacePct} invert />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

/** A small color-coded cell. `invert` flips the threshold semantics for
 *  pace — high pace (near cap) is amber/red, not green. */
function PerfCell({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  let tone: "good" | "warn" | "bad";
  if (invert) {
    tone = value >= 90 ? "bad" : value >= 70 ? "warn" : "good";
  } else {
    tone = value >= 60 ? "good" : value >= 35 ? "warn" : "bad";
  }
  const cls =
    tone === "good"
      ? "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30"
      : tone === "warn"
        ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30"
        : "bg-destructive/15 text-destructive border-destructive/30";
  return (
    <div className={cn("flex w-14 flex-col items-center rounded-md border px-1 py-1 text-center", cls)}>
      <span className="text-[10px] font-semibold tabular-nums leading-none">
        {formatPercent(value, 0)}
      </span>
      <span className="mt-0.5 text-[8px] uppercase tracking-wider leading-none opacity-80">{label}</span>
    </div>
  );
}
