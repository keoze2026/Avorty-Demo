"use client";

import { DollarSign, Hash, PhoneCall, Receipt, TrendingUp } from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { makeSparkline } from "@/lib/mock/timeseries";
import type { Publisher } from "@/lib/types";

export function PublisherStatsRow({ publisher }: { publisher: Publisher }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiTile
        label="Calls today"
        icon={PhoneCall}
        value={publisher.callsToday}
        formatValue={(v) => formatCompact(Math.round(v))}
        accent="cyan"
        sparkline={makeSparkline(31, 8, 40, 25)}
      />
      <KpiTile
        label="Revenue today"
        icon={DollarSign}
        value={publisher.revenueToday}
        formatValue={(v) => formatCurrency(v)}
        accent="emerald"
        sparkline={makeSparkline(32, 8, 60, 20)}
      />
      <KpiTile
        label="Conversion"
        icon={TrendingUp}
        value={publisher.conversionRate * 100}
        formatValue={(v) => formatPercent(v, 0)}
        accent="violet"
        sparkline={makeSparkline(33, 8, 55, 14)}
      />
      <KpiTile
        label="Numbers"
        icon={Hash}
        value={publisher.numbersAssigned}
        formatValue={(v) => formatCompact(Math.round(v))}
        accent="cyan"
      />
      <KpiTile
        label="Pending payout"
        icon={Receipt}
        value={publisher.pendingPayout}
        formatValue={(v) => formatCurrency(v)}
        accent="amber"
        foot={`${formatPercent(publisher.payoutRate * 100, 0)} share`}
      />
    </div>
  );
}
