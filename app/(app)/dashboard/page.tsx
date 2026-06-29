"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DashboardActivityCard } from "@/components/dashboard/dashboard-activity-card";
import { DashboardMetricsBoard } from "@/components/dashboard/dashboard-metrics-board";
import { DashboardPerformanceGauges } from "@/components/dashboard/dashboard-performance-gauges";
import { DestinationSummaryTable } from "@/components/dashboard/destination-summary-table";
import { HeroRevenueCard } from "@/components/dashboard/hero-revenue-card";
import { LivePulsePanel } from "@/components/dashboard/live-pulse-panel";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SystemOverviewStrip } from "@/components/dashboard/system-overview-strip";
import { TopBuyersBars } from "@/components/dashboard/top-buyers-bars";
import { TopCampaignsBars } from "@/components/dashboard/top-campaigns-bars";
import { VerticalDonut } from "@/components/dashboard/vertical-donut";
import { HourlyDistribution } from "@/components/reports/hourly-distribution";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { ExportMenu } from "@/components/shared/export-menu";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dateStamped, downloadRows, type ExportColumn, type ExportFormat } from "@/lib/export";
import { useBuyersStore } from "@/lib/store/buyers-store";
import { useCallsStore } from "@/lib/store/calls-store";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import { useDestinationsStore } from "@/lib/store/destinations-store";

const ALL_DEST = "all";

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

export default function DashboardPage() {
  const { t } = useTranslation();
  const destinations = useDestinationsStore((s) => s.destinations);
  // Calls now stream in from the backend via the calls store. The dashboard's
  // chart components still aggregate client-side off this list, so we pull a
  // generous slice (200 by default; tune via fetchRecent) at app mount.
  const recentCalls = useCallsStore((s) => s.recent);
  const kpis = useCallsStore((s) => s.kpis);
  // Buyers (live) — for the destination-dropdown label "buyer name" column,
  // the top-buyers leaderboard, and the activity feed.
  const buyers = useBuyersStore((s) => s.buyers);
  const buyerById = useMemo(() => new Map(buyers.map((b) => [b.id, b])), [buyers]);
  // Campaigns — used for the "active campaigns" KPI tile and downstream
  // leaderboards. Subscribing here means the count stays live as campaigns
  // are toggled on/off elsewhere in the app.
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === "active").length,
    [campaigns],
  );
  const [destinationTfn, setDestinationTfn] = useState<string>(ALL_DEST);
  const allSelected = destinationTfn === ALL_DEST;
  // Date-range filter — same shape and default as the Reports page so the
  // two surfaces feel consistent. Default = today only; the picker offers
  // presets (Yesterday, Last 7, Last 14, This/Last month) for quick jumps.
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });

  // Calls-today count per destination TFN — used inside the destination
  // dropdown's secondary label so the operator can see at a glance which
  // TFNs are hot today. Independent of the chosen date range above.
  const callsTodayByTfn = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const map = new Map<string, number>();
    for (const c of recentCalls) {
      if (c.startedAt < start.getTime()) continue;
      map.set(c.destinationNumber, (map.get(c.destinationNumber) ?? 0) + 1);
    }
    return map;
  }, [recentCalls]);

  // Apply the date-range filter first, then the destination filter, then
  // hand the result to the charts. Mirrors the Reports page exactly.
  const dateFilteredCalls = useMemo(() => {
    const start = dateRange?.from ? startOfDay(dateRange.from).getTime() : -Infinity;
    const end = dateRange?.from
      ? endOfDay(dateRange.to ?? dateRange.from).getTime()
      : Infinity;
    return recentCalls.filter((c) => c.startedAt >= start && c.startedAt <= end);
  }, [recentCalls, dateRange]);

  // When a destination is selected, scope everything to just its calls.
  const scopedCalls = useMemo(() => {
    if (allSelected) return dateFilteredCalls;
    return dateFilteredCalls.filter((c) => c.destinationNumber === destinationTfn);
  }, [destinationTfn, allSelected, dateFilteredCalls]);

  const onExport = (format: ExportFormat) => {
    const rows = buildDestinationExportRows(
      destinations,
      allSelected ? undefined : destinationTfn,
    );
    const stem = dateStamped(
      allSelected ? "vortyx-dashboard" : `vortyx-dashboard-${destinationTfn.replace(/\D/g, "")}`,
    );
    downloadRows(format, DASHBOARD_EXPORT_COLUMNS, rows, stem, "Destinations");
    toast.success(`Exported ${rows.length} destinations to ${format.toUpperCase()}`);
  };

  return (
    <>
      <PageHeader
        title={t("page.dashboard.title")}
        description={t("page.dashboard.description")}
        actions={
          <>
            <Select value={destinationTfn} onValueChange={setDestinationTfn}>
              <SelectTrigger size="sm" className="w-[20rem]">
                <SelectValue placeholder={t("dashboard.allDestinations")} />
              </SelectTrigger>
              <SelectContent align="end" className="max-h-80">
                <SelectItem value={ALL_DEST}>{t("dashboard.allDestinations")}</SelectItem>
                {destinations.map((d) => {
                  const buyer = buyerById.get(d.buyerId);
                  const calls = callsTodayByTfn.get(d.tfn) ?? 0;
                  return (
                    <SelectItem key={d.id} value={d.tfn}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{d.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {d.tfn}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {buyer?.name ?? "—"} · {calls} {t("dashboard.callsToday")}
                        </span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ExportMenu onExport={onExport}>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" /> {t("common.export")}
              </Button>
            </ExportMenu>
          </>
        }
      />

      {/*
        Bento-grid composition — 12-column base. Tiles span varying col +
        row counts so the page reads as an editorial composition rather
        than identical rows. Heights match within each row band thanks to
        `items-stretch` + `h-full` on the cards.
      */}

      {/* ─── Band 1 ── Hero composition ──────────────────────────────
          Featured revenue card (8 cols) + Live pulse panel (4 cols),
          same height, paired as a visual anchor for the page. */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HeroRevenueCard calls={scopedCalls} totalRevenue={kpis?.totalRevenue} />
        </div>
        <div className="lg:col-span-4">
          <LivePulsePanel
            liveCalls={kpis?.liveCalls ?? 0}
            calls={scopedCalls}
          />
        </div>
      </div>

      {/* ─── Band 2 ── Metrics board ─────────────────────────────────
          A unified data-table layout that replaces the six-tile KPI
          strip. Each row carries: status dot, icon, label, current
          value, 24h sparkline, change delta, and a "vs peak" progress
          bar. Reads as a Bloomberg-style metrics panel rather than
          isolated tiles — one composition, dense by design. */}
      <DashboardMetricsBoard
        calls={scopedCalls}
        kpis={kpis ?? null}
        activeCampaigns={activeCampaigns}
      />

      {/* ─── Band 3 ── Platform overview ─────────────────────────────
          Six entity counters in one full-width strip. Answers
          "what's wired up right now?" — the comprehensive view. */}
      <SystemOverviewStrip />

      {/* ─── Band 4 ── Asymmetric mid-section ────────────────────────
          Hourly chart (7 cols) + Donut (5 cols, narrower). The widths
          break out of the standard 8/4 split so the rhythm shifts
          downward through the page. */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <HourlyDistribution calls={scopedCalls} />
        </div>
        <div className="lg:col-span-5">
          <VerticalDonut calls={scopedCalls} />
        </div>
      </div>

      {/* ─── Band 5 ── Performance + Activity ────────────────────────
          Gauges (7 cols, the more visual half) + Activity feed
          (5 cols). Both height-locked via `items-stretch`. */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <DashboardPerformanceGauges
            calls={scopedCalls}
            liveCalls={kpis?.liveCalls}
          />
        </div>
        <div className="lg:col-span-5">
          <DashboardActivityCard calls={scopedCalls} buyers={buyers} />
        </div>
      </div>

      {/* ─── Band 6 ── Twin leaderboards ─────────────────────────────
          Top Campaigns + Top Buyers, both horizontal bar charts —
          identical visual vocabulary, paired at 50/50. */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <TopCampaignsBars calls={scopedCalls} />
        <TopBuyersBars calls={scopedCalls} buyers={buyers} />
      </div>

      {/* ─── Band 7 ── Revenue trend (full width) ────────────────────
          The line chart needs room to breathe; gets a row of its own. */}
      <RevenueChart calls={scopedCalls} />

      {/* ─── Band 8 ── Destinations detail table ──────────────────── */}
      <DestinationSummaryTable
        destinationFilter={allSelected ? undefined : destinationTfn}
      />
    </>
  );
}

/* ─── Export support ─── */

interface DestinationExportRow {
  destination: string;
  tfn: string;
  buyer: string;
  callsToday: number;
  revenueToday: number;
  concurrent: number;
  dailyCap: number;
  capPct: number;
}

const DASHBOARD_EXPORT_COLUMNS: ExportColumn<DestinationExportRow>[] = [
  { label: "Destination", value: (r) => r.destination },
  { label: "TFN", value: (r) => r.tfn },
  { label: "Buyer", value: (r) => r.buyer },
  { label: "Calls today", value: (r) => r.callsToday },
  { label: "Revenue today", value: (r) => Number(r.revenueToday.toFixed(2)) },
  { label: "Concurrent", value: (r) => r.concurrent },
  { label: "Daily cap", value: (r) => r.dailyCap },
  { label: "Cap %", value: (r) => Number(r.capPct.toFixed(1)) },
];

/** Mirror the on-screen Destinations card, scoped to the selected TFN if any. */
function buildDestinationExportRows(
  destinations: ReturnType<typeof useDestinationsStore.getState>["destinations"],
  filter: string | undefined,
): DestinationExportRow[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();

  // Pull the cached calls directly from the store — no React hook here since
  // this builder runs during the export click handler, not in render.
  const recentCalls = useCallsStore.getState().recent;

  const callsByTfn = new Map<string, number>();
  const revenueByTfn = new Map<string, number>();
  const ccByTfn = new Map<string, number>();
  for (const c of recentCalls) {
    if (c.startedAt >= startMs) {
      callsByTfn.set(c.destinationNumber, (callsByTfn.get(c.destinationNumber) ?? 0) + 1);
      revenueByTfn.set(
        c.destinationNumber,
        (revenueByTfn.get(c.destinationNumber) ?? 0) + c.revenue,
      );
    }
    if (c.status === "ringing" || c.status === "in-progress") {
      ccByTfn.set(c.destinationNumber, (ccByTfn.get(c.destinationNumber) ?? 0) + 1);
    }
  }

  // Buyers are pulled non-hook from the store since this runs at click time.
  const buyerById = new Map(
    useBuyersStore.getState().buyers.map((b) => [b.id, b]),
  );

  return destinations
    .filter((d) => !filter || d.tfn === filter)
    .map<DestinationExportRow>((d) => {
      const callsToday = callsByTfn.get(d.tfn) ?? 0;
      return {
        destination: d.name,
        tfn: d.tfn,
        buyer: buyerById.get(d.buyerId)?.name ?? "—",
        callsToday,
        revenueToday: revenueByTfn.get(d.tfn) ?? 0,
        concurrent: ccByTfn.get(d.tfn) ?? 0,
        dailyCap: d.dailyCap,
        capPct: d.dailyCap > 0 ? Math.min(100, (callsToday / d.dailyCap) * 100) : 0,
      };
    })
    .sort((a, b) => b.revenueToday - a.revenueToday);
}
