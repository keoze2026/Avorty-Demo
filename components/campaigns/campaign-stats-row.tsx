"use client";

import { Activity, DollarSign, Hash, PhoneCall, Timer, TrendingUp } from "lucide-react";

import { KpiTile } from "@/components/dashboard/kpi-tile";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { makeSparkline } from "@/lib/mock/timeseries";
import type { Campaign } from "@/lib/types";

export function CampaignStatsRow({ campaign }: { campaign: Campaign }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      <KpiTile
        label="Calls today"
        icon={PhoneCall}
        value={campaign.callsToday}
        formatValue={(v) => formatCompact(Math.round(v))}
        accent="cyan"
        sparkline={makeSparkline(11, 8, 40, 20)}
      />
      <KpiTile
        label="Revenue today"
        icon={DollarSign}
        value={campaign.revenueToday}
        formatValue={(v) => formatCurrency(v)}
        accent="emerald"
        sparkline={makeSparkline(12, 8, 55, 18)}
      />
      <KpiTile
        label="Conversion"
        icon={TrendingUp}
        value={campaign.conversionRate * 100}
        formatValue={(v) => formatPercent(v, 0)}
        accent="violet"
        sparkline={makeSparkline(13, 8, 55, 14)}
      />
      <KpiTile
        label="Avg qualify"
        icon={Timer}
        value={campaign.qualifyDurationSec}
        formatValue={(v) => `${Math.round(v)}s`}
        accent="amber"
      />
      <KpiTile
        label="Numbers"
        icon={Hash}
        value={campaign.numbersCount}
        formatValue={(v) => formatCompact(Math.round(v))}
        accent="cyan"
        foot={
          campaign.dailyCap === 0
            ? "Unlimited daily cap"
            : `Daily cap ${formatCompact(campaign.dailyCap)}`
        }
      />
    </div>
  );
}
