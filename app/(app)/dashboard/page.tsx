import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { AiRecommendations } from "@/components/dashboard/ai-recommendations";
import { CallVolumeChart } from "@/components/dashboard/call-volume-chart";
import { GeoDistribution } from "@/components/dashboard/geo-distribution";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { RecentCallsFeed } from "@/components/dashboard/recent-calls-feed";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopCampaignsTable } from "@/components/dashboard/top-campaigns-table";
import { LiveBadge } from "@/components/shared/live-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";
import { MOCK_CALLS } from "@/lib/mock/calls";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  // Derive aggregates from mock fixtures so KPI values stay consistent with the lists below.
  const callsToday = TODAY_HOURLY.reduce((s, p) => s + p.calls, 0);
  const revenueToday = TODAY_HOURLY.reduce((s, p) => s + p.revenue, 0);
  const completedConversions = TODAY_HOURLY.reduce((s, p) => s + p.conversions, 0);
  const conversionRate = completedConversions / Math.max(callsToday, 1);
  const completedCalls = MOCK_CALLS.filter((c) => c.status === "completed");
  const avgDurationSec =
    completedCalls.reduce((s, c) => s + c.durationSec, 0) / Math.max(completedCalls.length, 1);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today's calls, revenue, and what's trending across your network."
        actions={
          <>
            <LiveBadge label="Live" className="hidden sm:inline-flex" />
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4" /> AI summary
            </Button>
          </>
        }
      />

      {/* Headline KPIs */}
      <KpiRow
        callsToday={callsToday}
        revenueToday={revenueToday}
        conversionRate={conversionRate}
        avgDurationSec={avgDurationSec}
      />

      {/* Revenue (wide) + Geo (narrow) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <GeoDistribution />
        </div>
      </div>

      {/* Volume + Top campaigns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CallVolumeChart />
        </div>
        <div>
          <TopCampaignsTable />
        </div>
      </div>

      {/* AI strip */}
      <AiRecommendations />

      {/* Recent calls full-width */}
      <RecentCallsFeed />
    </>
  );
}
