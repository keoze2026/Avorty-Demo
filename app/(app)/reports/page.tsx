"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { CallLogTable } from "@/components/reports/call-log-table";
import { CallPerfCard } from "@/components/reports/call-perf-card";
import { CallSummaryTable } from "@/components/reports/call-summary-table";
import { HourlyDistribution } from "@/components/reports/hourly-distribution";
import { EMPTY_FILTERS, type ReportFilters } from "@/components/reports/reports-filter-popover";
import { ReportsToolbar } from "@/components/reports/reports-toolbar";
import { TotalCallsDonut } from "@/components/reports/total-calls-donut";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_CALLS } from "@/lib/mock/calls";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_FILTERS);

  const filtered = useMemo(() => {
    const start = dateRange?.from ? startOfDay(dateRange.from).getTime() : -Infinity;
    const end = dateRange?.from
      ? endOfDay(dateRange.to ?? dateRange.from).getTime()
      : Infinity;

    const campaignSet = new Set(filters.campaignIds);
    const buyerSet = new Set(filters.buyerIds);
    const publisherSet = new Set(filters.publisherIds);
    const statusSet = new Set(filters.statuses);

    return MOCK_CALLS.filter((c) => {
      if (c.startedAt < start || c.startedAt > end) return false;
      if (campaignSet.size > 0 && !campaignSet.has(c.campaignId)) return false;
      if (buyerSet.size > 0 && (!c.buyerId || !buyerSet.has(c.buyerId))) return false;
      if (publisherSet.size > 0 && (!c.publisherId || !publisherSet.has(c.publisherId))) {
        return false;
      }
      if (statusSet.size > 0 && !statusSet.has(c.status)) return false;
      return true;
    });
  }, [dateRange, filters]);

  const summary = useMemo(() => {
    const revenue = filtered.reduce((s, c) => s + c.revenue, 0);
    const payout = filtered.reduce((s, c) => s + c.payout, 0);
    return { revenue, payout };
  }, [filtered]);

  return (
    <>
      <PageHeader title="Reporting" description="Calls, performance, and detail logs." />

      <ReportsToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={() => toast.success("Reports refreshed")}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Row 1 — Hourly distribution (2/3) + perf card over donut (1/3). */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlyDistribution calls={filtered} />
        </div>
        <div className="flex flex-col gap-4 lg:h-full">
          <CallPerfCard revenue={summary.revenue} payout={summary.payout} />
          <div className="min-h-0 flex-1">
            <TotalCallsDonut calls={filtered} />
          </div>
        </div>
      </div>

      <CallSummaryTable calls={filtered} />

      <CallLogTable calls={filtered} />
    </>
  );
}
