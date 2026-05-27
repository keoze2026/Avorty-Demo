"use client";

import { useMemo } from "react";

import { CallLogTable } from "@/components/reports/call-log-table";
import { HourlyDistribution } from "@/components/reports/hourly-distribution";
import { TotalCallsDonut } from "@/components/reports/total-calls-donut";
import { MOCK_CALLS } from "@/lib/mock/calls";

interface CampaignPerformanceTabProps {
  campaignId: string;
}

export function CampaignPerformanceTab({ campaignId }: CampaignPerformanceTabProps) {
  const calls = useMemo(
    () => MOCK_CALLS.filter((c) => c.campaignId === campaignId),
    [campaignId],
  );

  return (
    <div className="space-y-4">
      {/* Hourly distribution (2/3) + outcomes donut (1/3) — same shape as /reports */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlyDistribution calls={calls} />
        </div>
        <div className="lg:h-full">
          <TotalCallsDonut calls={calls} />
        </div>
      </div>

      {/* Call log scoped to this campaign */}
      <CallLogTable calls={calls} limit={50} />
    </div>
  );
}
