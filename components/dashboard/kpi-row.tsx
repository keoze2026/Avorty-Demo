"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { formatCompact, formatCurrency, formatDuration, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface KpiRowProps {
  callsToday: number;
  revenueToday: number;
  conversionRate: number; // 0..1
  avgDurationSec: number;
}

interface KpiConfig {
  label: string;
  value: number;
  format: (v: number) => string;
  delta: number;
}

export function KpiRow({ callsToday, revenueToday, conversionRate, avgDurationSec }: KpiRowProps) {
  const kpis: KpiConfig[] = [
    {
      label: "Revenue",
      value: revenueToday,
      format: (v) => formatCurrency(v),
      delta: 8.7,
    },
    {
      label: "Calls",
      value: callsToday,
      format: (v) => formatCompact(Math.round(v)),
      delta: 12.4,
    },
    {
      label: "Conv. rate",
      value: conversionRate * 100,
      format: (v) => formatPercent(v),
      delta: -2.1,
    },
    {
      label: "Avg dur.",
      value: avgDurationSec,
      format: (v) => formatDuration(Math.round(v)),
      delta: 5.2,
    },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={cn(
              "px-3 py-3",
              i % 2 === 1 && "border-l border-border",
              i >= 2 && "border-t border-border",
              "lg:border-t-0",
              i > 0 && "lg:border-l lg:border-border",
            )}
          >
            <KpiSection {...k} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function KpiSection({ label, value, format, delta }: KpiConfig) {
  const animated = useCountUp(value);
  const positive = delta >= 0;
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">
        {label}
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-1.5">
        <span className="truncate text-lg font-semibold tabular-nums">{format(animated)}</span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium tabular-nums",
            positive ? "text-[color:var(--success)]" : "text-destructive",
          )}
        >
          {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {positive ? "+" : ""}
          {delta.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
