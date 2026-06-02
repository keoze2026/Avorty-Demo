"use client";

import { DollarSign, Hash, PhoneCall, Receipt, TrendingUp } from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { useTranslation } from "@/hooks/use-translation";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { makeSparkline } from "@/lib/mock/timeseries";
import type { Publisher } from "@/lib/types";

export function PublisherStatsRow({ publisher }: { publisher: Publisher }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiTile
        label={t("networkUI.publishers.stats.callsToday")}
        icon={PhoneCall}
        value={publisher.callsToday}
        formatValue={(v) => formatCompact(Math.round(v))}
        accent="cyan"
        sparkline={makeSparkline(31, 8, 40, 25)}
      />
      <KpiTile
        label={t("networkUI.publishers.stats.revenueToday")}
        icon={DollarSign}
        value={publisher.revenueToday}
        formatValue={(v) => formatCurrency(v)}
        accent="emerald"
        sparkline={makeSparkline(32, 8, 60, 20)}
      />
      <KpiTile
        label={t("networkUI.publishers.stats.conversion")}
        icon={TrendingUp}
        value={publisher.conversionRate * 100}
        formatValue={(v) => formatPercent(v, 0)}
        accent="violet"
        sparkline={makeSparkline(33, 8, 55, 14)}
      />
      <KpiTile
        label={t("networkUI.publishers.stats.numbers")}
        icon={Hash}
        value={publisher.numbersAssigned}
        formatValue={(v) => formatCompact(Math.round(v))}
        accent="cyan"
      />
      <KpiTile
        label={t("networkUI.publishers.stats.pendingPayout")}
        icon={Receipt}
        value={publisher.pendingPayout}
        formatValue={(v) => formatCurrency(v)}
        accent="amber"
        foot={t("networkUI.publishers.stats.payoutShare").replace("{pct}", formatPercent(publisher.payoutRate * 100, 0))}
      />
    </div>
  );
}
