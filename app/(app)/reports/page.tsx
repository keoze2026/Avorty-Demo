"use client";

import { useMemo, useState } from "react";
import { Building2, Megaphone, Users } from "lucide-react";
import { toast } from "sonner";

import { FunnelCard } from "@/components/reports/funnel-card";
import { GeoBreakdown } from "@/components/reports/geo-breakdown";
import { HourHeatmap } from "@/components/reports/hour-heatmap";
import { LeaderboardCard } from "@/components/reports/leaderboard-card";
import { ReportsToolbar } from "@/components/reports/reports-toolbar";
import { RevenueTimeline } from "@/components/reports/revenue-timeline";
import { SAVED_REPORTS, SavedReportsRail } from "@/components/reports/saved-reports-rail";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  byBuyer,
  byCampaign,
  byDay,
  byGeo,
  byPublisher,
  downloadCSV,
  filterByRange,
  funnel,
  heatmap,
  totals,
  type DateRange,
} from "@/lib/analytics";
import { ROUTES } from "@/lib/constants";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import { formatCompact, formatCurrency, formatDuration, formatPercent } from "@/lib/format";

const RANGE_DAYS: Record<DateRange, number> = { today: 1, "7d": 7, "14d": 14, "30d": 30 };

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState(SAVED_REPORTS[0].id);
  const [range, setRange] = useState<DateRange>("7d");
  const [campaignFilter, setCampaignFilter] = useState("all");

  const filtered = useMemo(() => {
    let calls = filterByRange(MOCK_CALLS, range);
    if (campaignFilter !== "all") calls = calls.filter((c) => c.campaignId === campaignFilter);
    return calls;
  }, [range, campaignFilter]);

  const summary = useMemo(() => totals(filtered), [filtered]);
  const dayData = useMemo(() => byDay(filtered, RANGE_DAYS[range]), [filtered, range]);
  const grid = useMemo(() => heatmap(filtered), [filtered]);
  const funnelSteps = useMemo(() => funnel(filtered), [filtered]);
  const topCampaigns = useMemo(() => byCampaign(filtered), [filtered]);
  const topBuyers = useMemo(() => byBuyer(filtered), [filtered]);
  const topPublishers = useMemo(() => byPublisher(filtered), [filtered]);
  const topGeo = useMemo(() => byGeo(filtered), [filtered]);

  const onRefresh = () => toast.success("Reports refreshed");
  const onExport = () => {
    downloadCSV(filtered, `vortyx-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${filtered.length} calls to CSV`);
  };

  const activeReportMeta = SAVED_REPORTS.find((r) => r.id === activeReport);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Interactive analytics with cross-filtering and drill-down."
        actions={
          activeReportMeta?.starred && (
            <Badge variant="default" className="border-accent/30 bg-accent/15 text-accent">
              ★ {activeReportMeta.name}
            </Badge>
          )
        }
      />

      <ReportsToolbar
        range={range}
        onRange={setRange}
        campaignFilter={campaignFilter}
        onCampaign={setCampaignFilter}
        campaigns={MOCK_CAMPAIGNS}
        onRefresh={onRefresh}
        onExport={onExport}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <Kpi label="Calls" value={formatCompact(summary.count)} />
        <Kpi label="Won" value={formatCompact(summary.completed)} />
        <Kpi label="Revenue" value={formatCurrency(summary.revenue)} />
        <Kpi label="Conversion" value={formatPercent(summary.conversionRate * 100, 1)} />
        <Kpi label="Avg duration" value={formatDuration(summary.avgDurationSec)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
          <SavedReportsRail activeId={activeReport} onSelect={setActiveReport} />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueTimeline data={dayData} />
            </div>
            <div>
              <FunnelCard steps={funnelSteps} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LeaderboardCard
              title="Top campaigns"
              icon={Megaphone}
              rows={topCampaigns}
              hrefFor={(r) => `${ROUTES.campaigns}/${r.key}`}
            />
            <LeaderboardCard
              title="Top buyers"
              icon={Building2}
              rows={topBuyers}
              hrefFor={(r) => `${ROUTES.buyers}/${r.key}`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <HourHeatmap grid={grid} />
            </div>
            <div>
              <LeaderboardCard
                title="Top publishers"
                icon={Users}
                rows={topPublishers}
                hrefFor={(r) => `${ROUTES.publishers}/${r.key}`}
              />
            </div>
          </div>

          <GeoBreakdown rows={topGeo} />
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-mono text-2xl font-semibold">{value}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
