"use client";

import { Activity, DollarSign, Gauge, PhoneCall, TrendingUp } from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { makeSparkline } from "@/lib/mock/timeseries";
import type { Buyer } from "@/lib/types";

export function BuyerStatsRow({ buyer }: { buyer: Buyer }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiTile
        label="Calls today"
        icon={PhoneCall}
        value={buyer.callsToday}
        formatValue={(v) => formatCompact(Math.round(v))}
        accent="cyan"
        sparkline={makeSparkline(21, 8, 35, 25)}
      />
      <KpiTile
        label="Spend today"
        icon={DollarSign}
        value={buyer.spendToday}
        formatValue={(v) => formatCurrency(v)}
        accent="emerald"
        sparkline={makeSparkline(22, 8, 55, 20)}
      />
      <KpiTile
        label="Accept rate"
        icon={Activity}
        value={buyer.acceptRate * 100}
        formatValue={(v) => formatPercent(v, 0)}
        accent="violet"
        sparkline={makeSparkline(23, 8, 70, 12)}
      />
      <KpiTile
        label="Conversion"
        icon={TrendingUp}
        value={buyer.conversionRate * 100}
        formatValue={(v) => formatPercent(v, 0)}
        accent="cyan"
        sparkline={makeSparkline(24, 8, 60, 14)}
      />
      <KpiTile
        label="Bid / call"
        icon={Gauge}
        value={buyer.bidAmount}
        formatValue={(v) => formatCurrency(v, true)}
        accent="amber"
        foot={buyer.payoutModel === "tiered" ? "Tiered" : "Flat"}
      />
    </div>
  );
}
