"use client";

/**
 * Today's activity feed — a rolling stream of "things that happened" on
 * the floor today. Inspired by the HR-dashboard reference (Today's
 * Attendance + Late Comers): a compact card that gives the operator a
 * pulse on what's noteworthy without leaving the dashboard.
 *
 * Events are derived locally from the current call slice + entity stores
 * so they stay consistent with the rest of the page — no separate
 * activity endpoint required. We surface:
 *
 *   • Latest converted call (with revenue + buyer)
 *   • Recent dropped calls (rejected / failed)
 *   • Campaigns trending hot today
 *   • Buyers near their daily cap
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  PhoneMissed,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Buyer, Call } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardActivityCardProps {
  calls: Call[];
  buyers: Buyer[];
}

type Tone = "success" | "destructive" | "accent" | "warning" | "violet";

interface Event {
  id: string;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  detail: string;
  ts: number;
}

const TONE_CLASSES: Record<Tone, { bg: string; text: string; bar: string }> = {
  success:     { bg: "bg-[color:var(--success)]/15",     text: "text-[color:var(--success)]",     bar: "bg-[color:var(--success)]" },
  destructive: { bg: "bg-destructive/15",                text: "text-destructive",                bar: "bg-destructive" },
  accent:      { bg: "bg-accent/15",                     text: "text-accent",                     bar: "bg-accent" },
  warning:     { bg: "bg-[color:var(--warning)]/15",     text: "text-[color:var(--warning)]",     bar: "bg-[color:var(--warning)]" },
  violet:      { bg: "bg-[oklch(0.6_0.2_290)]/15",       text: "text-[oklch(0.6_0.2_290)] dark:text-[oklch(0.78_0.2_290)]", bar: "bg-[oklch(0.6_0.2_290)]" },
};

export function DashboardActivityCard({ calls, buyers }: DashboardActivityCardProps) {
  const events = useMemo<Event[]>(() => {
    const out: Event[] = [];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startMs = startOfToday.getTime();
    const today = calls.filter((c) => c.startedAt >= startMs);

    // ─── Top-revenue converted call today ───────────────────────────────
    const completed = today.filter((c) => c.status === "completed" && c.revenue > 0);
    const topRev = [...completed].sort((a, b) => b.revenue - a.revenue)[0];
    if (topRev) {
      out.push({
        id: `top-rev-${topRev.id}`,
        icon: Sparkles,
        tone: "violet",
        title: "Highest-value sale today",
        detail: `${formatCurrency(topRev.revenue)} · ${topRev.campaignName}${topRev.buyerName ? ` · ${topRev.buyerName}` : ""}`,
        ts: topRev.startedAt,
      });
    }

    // ─── Most recent converted call ─────────────────────────────────────
    const latestConverted = [...completed].sort((a, b) => b.startedAt - a.startedAt)[0];
    if (latestConverted && latestConverted.id !== topRev?.id) {
      out.push({
        id: `latest-conv-${latestConverted.id}`,
        icon: CheckCircle2,
        tone: "success",
        title: "New conversion",
        detail: `${latestConverted.campaignName}${latestConverted.buyerName ? ` → ${latestConverted.buyerName}` : ""} · ${formatCurrency(latestConverted.revenue)}`,
        ts: latestConverted.startedAt,
      });
    }

    // ─── Trending-hot campaign (largest call count in last 2h vs the
    //     prior 2h) — surfaces "this campaign just lit up" without
    //     needing a real trend store. ────────────────────────────────────
    const now = Date.now();
    const twoH = 2 * 60 * 60 * 1000;
    const recent = today.filter((c) => c.startedAt >= now - twoH);
    const prior = today.filter((c) => c.startedAt >= now - 2 * twoH && c.startedAt < now - twoH);
    const recentByCamp = new Map<string, { name: string; count: number }>();
    for (const c of recent) {
      const k = c.campaignName ?? c.campaignId;
      if (!k) continue;
      const e = recentByCamp.get(k) ?? { name: k, count: 0 };
      e.count++;
      recentByCamp.set(k, e);
    }
    const priorByCamp = new Map<string, number>();
    for (const c of prior) {
      const k = c.campaignName ?? c.campaignId;
      if (!k) continue;
      priorByCamp.set(k, (priorByCamp.get(k) ?? 0) + 1);
    }
    const trending = Array.from(recentByCamp.values())
      .map((e) => {
        const pri = priorByCamp.get(e.name) ?? 0;
        const delta = pri > 0 ? ((e.count - pri) / pri) * 100 : e.count > 10 ? 200 : 0;
        return { ...e, delta };
      })
      .filter((e) => e.delta > 30 && e.count >= 8)
      .sort((a, b) => b.delta - a.delta)[0];
    if (trending) {
      out.push({
        id: `trending-${trending.name}`,
        icon: Flame,
        tone: "warning",
        title: "Trending campaign",
        detail: `${trending.name} · +${Math.round(trending.delta)}% vs prior 2h (${trending.count} calls)`,
        ts: now - 5 * 60 * 1000,
      });
    }

    // ─── Buyer near daily cap (>= 85% utilization) ──────────────────────
    const buyersByCallsToday = new Map<string, number>();
    for (const c of today) {
      if (!c.buyerId) continue;
      buyersByCallsToday.set(c.buyerId, (buyersByCallsToday.get(c.buyerId) ?? 0) + 1);
    }
    const nearCap = buyers
      .map((b) => ({
        name: b.name,
        callsToday: buyersByCallsToday.get(b.id) ?? 0,
        cap: b.dailyCap ?? 0,
      }))
      .filter((b) => b.cap > 0 && b.callsToday / b.cap >= 0.85)
      .sort((a, b) => b.callsToday / b.cap - a.callsToday / a.cap)[0];
    if (nearCap) {
      const pct = Math.round((nearCap.callsToday / nearCap.cap) * 100);
      out.push({
        id: `near-cap-${nearCap.name}`,
        icon: AlertTriangle,
        tone: "warning",
        title: "Buyer nearing daily cap",
        detail: `${nearCap.name} · ${pct}% (${formatNumber(nearCap.callsToday)} / ${formatNumber(nearCap.cap)})`,
        ts: now - 12 * 60 * 1000,
      });
    }

    // ─── Recent missed-spike (last 30 min ≥ 8 missed) ───────────────────
    const recentMissed = today.filter(
      (c) => (c.status === "missed" || c.status === "rejected") && c.startedAt >= now - 30 * 60 * 1000,
    );
    if (recentMissed.length >= 8) {
      out.push({
        id: `missed-spike`,
        icon: PhoneMissed,
        tone: "destructive",
        title: "Missed-call spike",
        detail: `${recentMissed.length} unanswered in the last 30 min`,
        ts: now - 8 * 60 * 1000,
      });
    }

    // ─── Best-converting campaign of the day ────────────────────────────
    const callsByCampaign = new Map<string, { name: string; total: number; converted: number }>();
    for (const c of today) {
      const k = c.campaignName ?? c.campaignId;
      if (!k) continue;
      const e = callsByCampaign.get(k) ?? { name: k, total: 0, converted: 0 };
      e.total++;
      if (c.status === "completed") e.converted++;
      callsByCampaign.set(k, e);
    }
    const bestCamp = Array.from(callsByCampaign.values())
      .filter((e) => e.total >= 12)
      .map((e) => ({ ...e, rate: e.converted / e.total }))
      .sort((a, b) => b.rate - a.rate)[0];
    if (bestCamp) {
      out.push({
        id: `best-conv-${bestCamp.name}`,
        icon: TrendingUp,
        tone: "accent",
        title: "Best-converting campaign",
        detail: `${bestCamp.name} · ${(bestCamp.rate * 100).toFixed(1)}% on ${formatNumber(bestCamp.total)} calls`,
        ts: now - 22 * 60 * 1000,
      });
    }

    return out.sort((a, b) => b.ts - a.ts).slice(0, 6);
  }, [calls, buyers]);

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">Today's activity</h3>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Auto-curated
          </p>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center text-xs text-muted-foreground">
            No notable activity yet today.
          </div>
        ) : (
          <ul className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {events.map((e, i) => {
              const tone = TONE_CLASSES[e.tone];
              const Icon = e.icon;
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="relative overflow-hidden rounded-lg border border-border/60 bg-secondary/15 p-2.5"
                >
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-0 left-0 w-0.5", tone.bar)}
                  />
                  <div className="flex items-start gap-2.5 pl-1.5">
                    <span className={cn("inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md", tone.bg, tone.text)}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold text-foreground">
                          {e.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {relTime(e.ts)}
                        </span>
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {e.detail}
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function relTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
