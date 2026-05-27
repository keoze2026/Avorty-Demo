"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { CallsChart } from "@/components/dashboard/calls-chart";
import { DestinationSummaryTable } from "@/components/dashboard/destination-summary-table";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopCampaignsBars } from "@/components/dashboard/top-campaigns-bars";
import { VerticalDonut } from "@/components/dashboard/vertical-donut";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { MOCK_DESTINATIONS } from "@/lib/mock/destinations";
import { TODAY_HOURLY } from "@/lib/mock/timeseries";

const ALL_DEST = "all";

// Buyer lookup for nicer destination-dropdown labels.
const BUYER_BY_ID = new Map(MOCK_BUYERS.map((b) => [b.id, b]));

// Calls-today count per destination TFN — drives the "{N} calls" annotation.
const CALLS_TODAY_BY_TFN = (() => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const map = new Map<string, number>();
  for (const c of MOCK_CALLS) {
    if (c.startedAt < start.getTime()) continue;
    map.set(c.destinationNumber, (map.get(c.destinationNumber) ?? 0) + 1);
  }
  return map;
})();

export default function DashboardPage() {
  const [destinationTfn, setDestinationTfn] = useState<string>(ALL_DEST);
  const allSelected = destinationTfn === ALL_DEST;

  // When a destination is selected, scope everything to just its calls.
  // When "All destinations" is selected, pass undefined so each chart falls
  // back to its static seeded data (TODAY_HOURLY etc.).
  const scopedCalls = useMemo(() => {
    if (allSelected) return undefined;
    return MOCK_CALLS.filter((c) => c.destinationNumber === destinationTfn);
  }, [destinationTfn, allSelected]);

  const kpis = useMemo(() => {
    if (!scopedCalls) {
      const callsToday = TODAY_HOURLY.reduce((s, p) => s + p.calls, 0);
      const revenueToday = TODAY_HOURLY.reduce((s, p) => s + p.revenue, 0);
      const conversions = TODAY_HOURLY.reduce((s, p) => s + p.conversions, 0);
      const conversionRate = conversions / Math.max(callsToday, 1);
      const completedCalls = MOCK_CALLS.filter((c) => c.status === "completed");
      const avgDurationSec =
        completedCalls.reduce((s, c) => s + c.durationSec, 0) /
        Math.max(completedCalls.length, 1);
      return { callsToday, revenueToday, conversionRate, avgDurationSec };
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todays = scopedCalls.filter((c) => c.startedAt >= startOfToday.getTime());
    const completed = scopedCalls.filter((c) => c.status === "completed");
    const callsToday = todays.length;
    const revenueToday = todays.reduce((s, c) => s + c.revenue, 0);
    const conversions = todays.filter((c) => c.status === "completed").length;
    const conversionRate = conversions / Math.max(callsToday, 1);
    const avgDurationSec =
      completed.length > 0
        ? completed.reduce((s, c) => s + c.durationSec, 0) / completed.length
        : 0;
    return { callsToday, revenueToday, conversionRate, avgDurationSec };
  }, [scopedCalls]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today's performance at a glance."
        actions={
          <>
            <Select value={destinationTfn} onValueChange={setDestinationTfn}>
              <SelectTrigger size="sm" className="w-[20rem]">
                <SelectValue placeholder="All destinations" />
              </SelectTrigger>
              <SelectContent align="end" className="max-h-80">
                <SelectItem value={ALL_DEST}>All destinations</SelectItem>
                {MOCK_DESTINATIONS.map((d) => {
                  const buyer = BUYER_BY_ID.get(d.buyerId);
                  const calls = CALLS_TODAY_BY_TFN.get(d.tfn) ?? 0;
                  return (
                    <SelectItem key={d.id} value={d.tfn}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{d.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {d.tfn}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {buyer?.name ?? "—"} · {calls} calls
                        </span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      {/* Row 1 — Hourly CALLS chart (primary), KPIs + donut stacked on the right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CallsChart calls={scopedCalls} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <KpiRow {...kpis} />
          <VerticalDonut calls={scopedCalls} />
        </div>
      </div>

      {/* Row 2 — Top campaigns + Revenue trend (secondary) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopCampaignsBars calls={scopedCalls} />
        <RevenueChart calls={scopedCalls} />
      </div>

      {/* Row 3 — Destinations table (each TFN with its own CC and Cap) */}
      <DestinationSummaryTable
        destinationFilter={allSelected ? undefined : destinationTfn}
      />
    </>
  );
}
