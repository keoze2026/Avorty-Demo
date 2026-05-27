"use client";

import { useMemo } from "react";
import { Activity, DollarSign, Gauge, PhoneCall } from "lucide-react";

import { MOCK_CALLS } from "@/lib/mock/calls";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Destination } from "@/lib/types";

interface DestinationStatsRowProps {
  destination: Destination;
}

export function DestinationStatsRow({ destination }: DestinationStatsRowProps) {
  const stats = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();
    let calls = 0;
    let revenue = 0;
    let cc = 0;
    for (const c of MOCK_CALLS) {
      if (c.destinationNumber !== destination.tfn) continue;
      if (c.startedAt >= startMs) {
        calls += 1;
        revenue += c.revenue;
      }
      if (c.status === "ringing" || c.status === "in-progress") cc += 1;
    }
    const ccPct =
      destination.concurrencyCap > 0 ? (cc / destination.concurrencyCap) * 100 : 0;
    return { calls, revenue, cc, ccPct };
  }, [destination]);

  const tiles = [
    {
      icon: PhoneCall,
      label: "Calls today",
      value: formatCompact(stats.calls),
    },
    {
      icon: DollarSign,
      label: "Revenue today",
      value: formatCurrency(stats.revenue),
    },
    {
      icon: Activity,
      label: "Concurrent now",
      value: `${stats.cc} / ${destination.concurrencyCap}`,
    },
    {
      icon: Gauge,
      label: "CC utilization",
      value: formatPercent(stats.ccPct, 0),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-lg font-semibold tabular-nums">{t.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
