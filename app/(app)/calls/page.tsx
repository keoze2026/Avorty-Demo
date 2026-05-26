"use client";

import { useMemo, useState } from "react";
import { PhoneCall } from "lucide-react";
import { toast } from "sonner";

import { CallDetailSheet } from "@/components/calls/call-detail-sheet";
import { ALL_COLUMNS, CallsToolbar } from "@/components/calls/calls-toolbar";
import { CallsTable } from "@/components/calls/calls-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { downloadCSV, filterByRange, totals, type DateRange } from "@/lib/analytics";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import { formatCompact, formatCurrency, formatDuration, formatPercent } from "@/lib/format";
import type { Call, CallStatus } from "@/lib/types";

const DEFAULT_VISIBLE = new Set(ALL_COLUMNS.map((c) => c.id));

export default function CallsPage() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRange>("7d");
  const [statuses, setStatuses] = useState<Set<CallStatus>>(new Set());
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(DEFAULT_VISIBLE);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState<Call | null>(null);

  const filtered = useMemo(() => {
    let calls = filterByRange(MOCK_CALLS, range);
    if (campaignFilter !== "all") calls = calls.filter((c) => c.campaignId === campaignFilter);
    if (statuses.size > 0) calls = calls.filter((c) => statuses.has(c.status));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      calls = calls.filter((c) =>
        `${c.callerNumber} ${c.campaignName} ${c.publisherName ?? ""} ${c.buyerName ?? ""} ${c.geo.state ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }
    return calls;
  }, [query, range, campaignFilter, statuses]);

  const summary = useMemo(() => totals(filtered), [filtered]);

  // Reset page on filter change
  const filterKey = `${query}|${range}|${campaignFilter}|${[...statuses].sort().join(",")}`;
  useMemoResetPage(filterKey, setPage);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const toggleStatus = (s: CallStatus) =>
    setStatuses((curr) => {
      const next = new Set(curr);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const toggleColumn = (id: string) =>
    setVisibleColumns((curr) => {
      const next = new Set(curr);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onExport = () => {
    downloadCSV(filtered, `vortyx-calls-${range}-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${filtered.length} calls to CSV`);
  };

  return (
    <>
      <PageHeader
        title="Call logs"
        description="Every call your network has handled — search, filter, and drill down."
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total calls" value={formatCompact(summary.count)} />
        <SummaryCard label="Won" value={formatCompact(summary.completed)} />
        <SummaryCard label="Conversion" value={formatPercent(summary.conversionRate * 100, 1)} />
        <SummaryCard label="Revenue" value={formatCurrency(summary.revenue)} />
      </div>

      <CallsToolbar
        query={query}
        onQuery={setQuery}
        range={range}
        onRange={setRange}
        statuses={statuses}
        onToggleStatus={toggleStatus}
        campaignFilter={campaignFilter}
        onCampaign={setCampaignFilter}
        campaigns={MOCK_CAMPAIGNS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onExport={onExport}
        count={filtered.length}
        total={MOCK_CALLS.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={PhoneCall}
          tone="cyan"
          title="No calls match"
          description="Try widening the date range, clearing the search box, or relaxing status filters."
        />
      ) : (
        <>
          <CallsTable
            calls={paged}
            visibleColumns={visibleColumns}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPage={setPage}
            onPageSize={(n) => {
              setPageSize(n);
              setPage(0);
            }}
          />
        </>
      )}

      {/* Tiny footer note explaining avg duration */}
      <p className="-mt-3 text-[11px] text-muted-foreground">
        Avg duration on completed calls: <span className="font-mono text-foreground">{formatDuration(summary.avgDurationSec)}</span>
      </p>

      <CallDetailSheet
        call={selected}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      />
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-2xl font-semibold">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

/** Tiny hook — resets a page counter when a dependency key changes. */
import { useEffect } from "react";
function useMemoResetPage(key: string, setPage: (n: number) => void) {
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
