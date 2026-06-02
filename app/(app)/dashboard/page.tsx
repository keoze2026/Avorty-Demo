"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DestinationSummaryTable } from "@/components/dashboard/destination-summary-table";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopCampaignsBars } from "@/components/dashboard/top-campaigns-bars";
import { VerticalDonut } from "@/components/dashboard/vertical-donut";
import { HourlyDistribution } from "@/components/reports/hourly-distribution";
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
import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { useDestinationsStore } from "@/lib/store/destinations-store";

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
  const { t } = useTranslation();
  const destinations = useDestinationsStore((s) => s.destinations);
  const [destinationTfn, setDestinationTfn] = useState<string>(ALL_DEST);
  const allSelected = destinationTfn === ALL_DEST;

  // When a destination is selected, scope everything to just its calls.
  // When "All destinations" is selected, pass the full MOCK_CALLS slice so
  // the chart and donut use the same dataset as the topbar's TOTAL counter
  // — keeps the headline numbers (3,016 today) consistent across surfaces.
  const scopedCalls = useMemo(() => {
    if (allSelected) return MOCK_CALLS;
    return MOCK_CALLS.filter((c) => c.destinationNumber === destinationTfn);
  }, [destinationTfn, allSelected]);

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
                          {buyer?.name ?? "—"} · {calls} {t("dashboard.callsToday")}
                        </span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <ExportMenu onExport={onExport}>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" /> {t("common.export")}
              </Button>
            </ExportMenu>
          </>
        }
      />

      {/* Row 1 — Hourly CALLS chart (primary) + donut on the right.
          Uses the same composed-chart component as the Reports page so the
          two surfaces share an identical visual language. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlyDistribution calls={scopedCalls} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
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

  const callsByTfn = new Map<string, number>();
  const revenueByTfn = new Map<string, number>();
  const ccByTfn = new Map<string, number>();
  for (const c of MOCK_CALLS) {
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

  const buyerById = new Map(MOCK_BUYERS.map((b) => [b.id, b]));

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
