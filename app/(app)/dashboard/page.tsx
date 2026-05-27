import type { Metadata } from "next";
import { Download } from "lucide-react";

import { CallVolumeChart } from "@/components/dashboard/call-volume-chart";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopCampaignsBars } from "@/components/dashboard/top-campaigns-bars";
import { VerticalDonut } from "@/components/dashboard/vertical-donut";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const callsToday = TODAY_HOURLY.reduce((s, p) => s + p.calls, 0);
  const revenueToday = TODAY_HOURLY.reduce((s, p) => s + p.revenue, 0);
  const conversions = TODAY_HOURLY.reduce((s, p) => s + p.conversions, 0);
  const conversionRate = conversions / Math.max(callsToday, 1);
  const completedCalls = MOCK_CALLS.filter((c) => c.status === "completed");
  const avgDurationSec =
    completedCalls.reduce((s, c) => s + c.durationSec, 0) / Math.max(completedCalls.length, 1);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today's performance at a glance."
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />

      {/* Row 1 — Revenue chart on the left, slim KPI block + donut stacked on the right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <KpiRow
            callsToday={callsToday}
            revenueToday={revenueToday}
            conversionRate={conversionRate}
            avgDurationSec={avgDurationSec}
          />
          <VerticalDonut />
        </div>
      </div>

      {/* Row 2 — Horizontal bars + vertical bars */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopCampaignsBars />
        <CallVolumeChart />
      </div>
    </>
  );
}
