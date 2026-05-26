/**
 * Activity ticker — horizontal marquee of recent call settlements.
 * Pure presentation: pulls from MOCK_CALLS so it's stable for SSR.
 */

"use client";

import { CheckCircle2, MapPin, PhoneMissed, XCircle } from "lucide-react";

import { MOCK_CALLS } from "@/lib/mock/calls";
import { formatCurrency, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

type Item = { id: string; status: "won" | "missed" | "rejected"; campaign: string; geo: string; payout: number; duration: number };

function pickItems(): Item[] {
  return MOCK_CALLS.slice(0, 18).map((c) => ({
    id: c.id,
    status:
      c.status === "completed" ? "won" : c.status === "missed" ? "missed" : "rejected",
    campaign: c.campaignName,
    geo: c.geo.state ?? "—",
    payout: c.payout ?? 0,
    duration: c.durationSec,
  }));
}

const STATUS = {
  won: { label: "WON", icon: CheckCircle2, tone: "text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]" },
  missed: { label: "MISS", icon: PhoneMissed, tone: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]" },
  rejected: { label: "REJ", icon: XCircle, tone: "text-destructive" },
} as const;

export function ActivityTicker() {
  const items = pickItems();
  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      {/* Edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-card to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-card to-transparent"
      />

      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="shrink-0 rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.2em] text-accent">
          TAPE
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max gap-6 animate-ticker">
            {loop.map((it, i) => {
              const s = STATUS[it.status];
              const Icon = s.icon;
              return (
                <span
                  key={`${it.id}-${i}`}
                  className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground"
                >
                  <Icon className={cn("h-3 w-3", s.tone)} />
                  <span className={cn("font-semibold", s.tone)}>{s.label}</span>
                  <span className="text-foreground">{it.campaign}</span>
                  <span className="inline-flex items-center gap-1 opacity-70">
                    <MapPin className="h-2.5 w-2.5" />
                    {it.geo}
                  </span>
                  <span className="opacity-70">{formatDuration(it.duration)}</span>
                  <span className="text-accent">
                    {it.payout > 0 ? formatCurrency(it.payout, true) : "$0.00"}
                  </span>
                  <span aria-hidden className="text-border">·</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
