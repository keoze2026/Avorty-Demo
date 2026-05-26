import type { Metadata } from "next";
import { Download, Sparkles } from "lucide-react";

import { ActivityTicker } from "@/components/dashboard/activity-ticker";
import { AiSignals } from "@/components/dashboard/ai-signals";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { GeoPulse } from "@/components/dashboard/geo-pulse";
import { HourRhythm } from "@/components/dashboard/hour-rhythm";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { RevenueStream } from "@/components/dashboard/revenue-stream";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";

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
        description="Mission control for every call, dollar, and signal across your network."
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4" /> AI summary
            </Button>
          </>
        }
      />

      {/* Mission-control hero */}
      <DashboardHero
        callsToday={callsToday}
        revenueToday={revenueToday}
        conversionRate={conversionRate}
        avgDurationSec={avgDurationSec}
      />

      {/* Container-query bento. Breakpoints respond to the actual content
          area (open sidebar shrinks it), not the viewport:
          - default               : 1 col stack
          - @3xl/main (≥768px)    : 2 col paired
          - @6xl/main (≥1152px)   : full 12-col asymmetric bento */}
      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        {/* Row 1 — Revenue (7) / Geo (5) */}
        <div className="min-w-0 @6xl/main:col-span-7">
          <RevenueStream />
        </div>
        <div className="min-w-0 @6xl/main:col-span-5">
          <GeoPulse />
        </div>

        {/* Row 2 — at @3xl: Hour | Leaderboard, AI full-width.
                    at @6xl: 5 / 4 / 3 */}
        <div className="min-w-0 @6xl/main:col-span-5">
          <HourRhythm />
        </div>
        <div className="min-w-0 @6xl/main:col-span-4">
          <Leaderboard />
        </div>
        <div className="min-w-0 @3xl/main:col-span-2 @6xl/main:col-span-3">
          <AiSignals />
        </div>
      </div>

      {/* Live activity tape */}
      <ActivityTicker />
    </>
  );
}
