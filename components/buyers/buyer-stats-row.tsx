"use client";

import type { LucideIcon } from "lucide-react";
import { Activity, DollarSign, Gauge, PhoneCall, TrendingUp } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import type { Buyer } from "@/lib/types";

/**
 * Compact one-row stat strip — designed to dock to the bottom of the buyer
 * detail header card. Five cells separated by hairlines; small icon + value +
 * sub-label, no sparklines, no padding bloat. The big KPI tile variant lives
 * in components/dashboard/kpi-tile.tsx and is still used on the main dashboard.
 */
export function BuyerStatsRow({ buyer }: { buyer: Buyer }) {
  const { t } = useTranslation();
  const cells: Array<{
    icon: LucideIcon;
    label: string;
    value: string;
    foot?: string;
  }> = [
    {
      icon: PhoneCall,
      label: t("networkUI.buyers.stats5.callsToday"),
      value: formatCompact(buyer.callsToday),
    },
    {
      icon: DollarSign,
      label: t("networkUI.buyers.stats5.spendToday"),
      value: formatCurrency(buyer.spendToday),
    },
    {
      icon: Activity,
      label: t("networkUI.buyers.stats5.acceptRate"),
      value: formatPercent(buyer.acceptRate * 100, 0),
    },
    {
      icon: TrendingUp,
      label: t("networkUI.buyers.stats5.conversion"),
      value: formatPercent(buyer.conversionRate * 100, 0),
    },
    {
      icon: Gauge,
      label: t("networkUI.buyers.stats5.bidCall"),
      value: formatCurrency(buyer.bidAmount, true),
      foot: buyer.payoutModel === "tiered" ? t("networkUI.buyers.stats5.tiered") : t("networkUI.buyers.stats5.flat"),
    },
  ];

  return (
    <div className="grid grid-cols-2 divide-x divide-border/60 sm:grid-cols-3 lg:grid-cols-5">
      {cells.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="flex items-center gap-2.5 px-3 py-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-base font-semibold leading-tight tabular-nums">
                {c.value}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {c.label}
                {c.foot && (
                  <span className="ml-1 text-muted-foreground/70">· {c.foot}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
