"use client";

import * as React from "react";
import { Download, Settings } from "lucide-react";
import { toast } from "sonner";

import { ExportMenu } from "@/components/shared/export-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Call } from "@/lib/types";
import { dateStamped, downloadRows, type ExportColumn, type ExportFormat } from "@/lib/export";
import { formatCurrency, formatNumber, formatPercent, formatTimer } from "@/lib/format";
import { cn } from "@/lib/utils";

type GroupKey = "campaign" | "vendor" | "destination" | "buyer" | "date";

const TABS: Array<{ id: GroupKey; label: string }> = [
  { id: "campaign", label: "Campaign" },
  { id: "vendor", label: "Vendor" },
  { id: "destination", label: "Destination" },
  { id: "buyer", label: "Buyer" },
  { id: "date", label: "Date" },
];

type ColumnKey =
  | "live"
  | "incoming"
  | "connected"
  | "qualified"
  | "paid"
  | "converted"
  | "noConnect"
  | "dupe"
  | "conversionRate"
  | "tcl"
  | "acl"
  | "payout"
  | "revenue"
  | "profit";

const COLUMNS: Array<{ id: ColumnKey; label: string }> = [
  { id: "live", label: "Live" },
  { id: "incoming", label: "Incoming" },
  { id: "connected", label: "Connected" },
  { id: "qualified", label: "Qualified" },
  { id: "paid", label: "Paid" },
  { id: "converted", label: "Converted" },
  { id: "noConnect", label: "Not Connected" },
  { id: "dupe", label: "Dupe" },
  { id: "conversionRate", label: "Conv. rate" },
  { id: "tcl", label: "TCL" },
  { id: "acl", label: "ACL" },
  { id: "payout", label: "Payout" },
  { id: "revenue", label: "Revenue" },
  { id: "profit", label: "Profit" },
];

const ALL_VISIBLE: Record<ColumnKey, boolean> = COLUMNS.reduce(
  (acc, c) => ({ ...acc, [c.id]: true }),
  {} as Record<ColumnKey, boolean>,
);

interface SummaryRow {
  key: string;
  label: string;
  live: number;
  incoming: number;
  connected: number;
  qualified: number;
  paid: number;
  converted: number;
  noConnect: number;
  dupe: number;
  conversionRate: number; // 0..1
  tcl: number; // total call length, seconds
  acl: number; // avg call length, seconds
  payout: number;
  revenue: number;
}

function dateKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function groupCalls(calls: Call[], group: GroupKey): SummaryRow[] {
  const m = new Map<string, SummaryRow>();
  for (const c of calls) {
    let key = "";
    let label = "";
    if (group === "campaign") {
      key = c.campaignId;
      label = c.campaignName;
    } else if (group === "vendor") {
      key = c.publisherId ?? "";
      label = c.publisherName ?? "—";
    } else if (group === "destination") {
      key = c.destinationNumber;
      label = c.destinationNumber;
    } else if (group === "buyer") {
      key = c.buyerId ?? "";
      label = c.buyerName ?? "—";
    } else {
      key = dateKey(c.startedAt);
      label = key;
    }
    if (!key) continue;

    let row = m.get(key);
    if (!row) {
      row = {
        key,
        label,
        live: 0,
        incoming: 0,
        connected: 0,
        qualified: 0,
        paid: 0,
        converted: 0,
        noConnect: 0,
        dupe: 0,
        conversionRate: 0,
        tcl: 0,
        acl: 0,
        payout: 0,
        revenue: 0,
      };
      m.set(key, row);
    }

    row.incoming += 1;
    if (c.status === "ringing" || c.status === "in-progress") row.live += 1;
    if (c.status === "completed" || c.status === "in-progress") row.connected += 1;
    if (c.status === "completed" && c.durationSec >= 60) row.qualified += 1;
    if (c.status === "completed" && c.payout > 0) {
      row.paid += 1;
      row.converted += 1;
    }
    if (c.status === "missed" || c.status === "rejected" || c.status === "failed") {
      row.noConnect += 1;
    }
    row.tcl += c.durationSec;
    row.payout += c.payout;
    row.revenue += c.revenue;
  }

  for (const row of m.values()) {
    row.conversionRate = row.incoming > 0 ? row.converted / row.incoming : 0;
    row.acl = row.connected > 0 ? Math.round(row.tcl / row.connected) : 0;
  }

  return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue);
}

function totalsOf(rows: SummaryRow[]): SummaryRow {
  const t: SummaryRow = {
    key: "_totals",
    label: "Totals",
    live: 0,
    incoming: 0,
    connected: 0,
    qualified: 0,
    paid: 0,
    converted: 0,
    noConnect: 0,
    dupe: 0,
    conversionRate: 0,
    tcl: 0,
    acl: 0,
    payout: 0,
    revenue: 0,
  };
  for (const r of rows) {
    t.live += r.live;
    t.incoming += r.incoming;
    t.connected += r.connected;
    t.qualified += r.qualified;
    t.paid += r.paid;
    t.converted += r.converted;
    t.noConnect += r.noConnect;
    t.dupe += r.dupe;
    t.tcl += r.tcl;
    t.payout += r.payout;
    t.revenue += r.revenue;
  }
  t.conversionRate = t.incoming > 0 ? t.converted / t.incoming : 0;
  t.acl = t.connected > 0 ? Math.round(t.tcl / t.connected) : 0;
  return t;
}

/** Single source of truth for what each summary column writes to a file cell.
 *  Numbers stay numeric so XLSX preserves them; rates serialize as a 0..1 ratio. */
function summaryCellValue(row: SummaryRow, key: ColumnKey): number | string {
  switch (key) {
    case "live":
      return row.live;
    case "incoming":
      return row.incoming;
    case "connected":
      return row.connected;
    case "qualified":
      return row.qualified;
    case "paid":
      return row.paid;
    case "converted":
      return row.converted;
    case "noConnect":
      return row.noConnect;
    case "dupe":
      return row.dupe;
    case "conversionRate":
      return Number(row.conversionRate.toFixed(4));
    case "tcl":
      return row.tcl;
    case "acl":
      return row.acl;
    case "payout":
      return row.payout;
    case "revenue":
      return row.revenue;
    case "profit":
      return row.revenue - row.payout;
  }
}

interface CallSummaryTableProps {
  calls: Call[];
}

export function CallSummaryTable({ calls }: CallSummaryTableProps) {
  const [tab, setTab] = React.useState<GroupKey>("campaign");
  const [visible, setVisible] = React.useState<Record<ColumnKey, boolean>>(ALL_VISIBLE);

  const rows = React.useMemo(() => groupCalls(calls, tab), [calls, tab]);
  const totals = React.useMemo(() => totalsOf(rows), [rows]);

  const visibleCount = COLUMNS.filter((c) => visible[c.id]).length;
  const colSpan = visibleCount + 1; // +1 for the label column

  const toggleColumn = (id: ColumnKey) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }));

  const onExport = (format: ExportFormat) => {
    // Only the columns the operator can currently see make it into the export.
    const labelCol: ExportColumn<SummaryRow> = {
      label: TABS.find((t) => t.id === tab)?.label ?? "Group",
      value: (r) => r.label,
    };
    const dataCols: ExportColumn<SummaryRow>[] = COLUMNS.filter((c) => visible[c.id]).map(
      (c) => ({
        label: c.label,
        value: (r) => summaryCellValue(r, c.id),
      }),
    );
    const stem = dateStamped(`vortyx-call-summary-${tab}`);
    downloadRows(format, [labelCol, ...dataCols], rows, stem, "Call summary");
    toast.success(`Exported ${rows.length} rows to ${format.toUpperCase()}`);
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Section title */}
      <div className="px-6 pt-5 text-sm font-semibold text-foreground">Call summary</div>

      {/* Tabs + right actions */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
                tab === t.id ? "text-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.id && (
                <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Column settings">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-0">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-sm font-semibold">Columns</span>
                <button
                  type="button"
                  onClick={() => setVisible(ALL_VISIBLE)}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Show all
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto px-2 py-2">
                {COLUMNS.map((col) => {
                  const id = `col-${col.id}`;
                  return (
                    <Label
                      key={col.id}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-secondary/50"
                    >
                      <Checkbox
                        id={id}
                        checked={visible[col.id]}
                        onCheckedChange={() => toggleColumn(col.id)}
                      />
                      <span>{col.label}</span>
                    </Label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          <ExportMenu onExport={onExport}>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Export">
              <Download className="h-4 w-4" />
            </Button>
          </ExportMenu>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-left">{TABS.find((t) => t.id === tab)?.label}</TableHead>
                {visible.live && <TableHead>Live</TableHead>}
                {visible.incoming && <TableHead>Incoming</TableHead>}
                {visible.connected && <TableHead>Connected</TableHead>}
                {visible.qualified && <TableHead>Qualified</TableHead>}
                {visible.paid && <TableHead>Paid</TableHead>}
                {visible.converted && <TableHead>Converted</TableHead>}
                {visible.noConnect && <TableHead>Not Connected</TableHead>}
                {visible.dupe && <TableHead>Dupe</TableHead>}
                {visible.conversionRate && <TableHead>Conv. rate</TableHead>}
                {visible.tcl && <TableHead>TCL</TableHead>}
                {visible.acl && <TableHead>ACL</TableHead>}
                {visible.payout && <TableHead>Payout</TableHead>}
                {visible.revenue && <TableHead>Revenue</TableHead>}
                {visible.profit && <TableHead className="pr-6">Profit</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={colSpan} className="pl-6 py-6 text-sm text-muted-foreground">
                    No calls in this range.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const profit = r.revenue - r.payout;
                  return (
                    <TableRow key={r.key}>
                      <TableCell className="pl-6 text-left font-medium">{r.label}</TableCell>
                      {visible.live && (
                        <TableCell className="tabular-nums">{formatNumber(r.live)}</TableCell>
                      )}
                      {visible.incoming && (
                        <TableCell className="tabular-nums">{formatNumber(r.incoming)}</TableCell>
                      )}
                      {visible.connected && (
                        <TableCell className="tabular-nums">{formatNumber(r.connected)}</TableCell>
                      )}
                      {visible.qualified && (
                        <TableCell className="tabular-nums">{formatNumber(r.qualified)}</TableCell>
                      )}
                      {visible.paid && (
                        <TableCell className="tabular-nums">{formatNumber(r.paid)}</TableCell>
                      )}
                      {visible.converted && (
                        <TableCell className="tabular-nums">{formatNumber(r.converted)}</TableCell>
                      )}
                      {visible.noConnect && (
                        <TableCell className="tabular-nums">{formatNumber(r.noConnect)}</TableCell>
                      )}
                      {visible.dupe && (
                        <TableCell className="tabular-nums">{formatNumber(r.dupe)}</TableCell>
                      )}
                      {visible.conversionRate && (
                        <TableCell className="tabular-nums">
                          {formatPercent(r.conversionRate * 100, 1)}
                        </TableCell>
                      )}
                      {visible.tcl && (
                        <TableCell className="font-mono tabular-nums">{formatTimer(r.tcl)}</TableCell>
                      )}
                      {visible.acl && (
                        <TableCell className="font-mono tabular-nums">{formatTimer(r.acl)}</TableCell>
                      )}
                      {visible.payout && (
                        <TableCell className="tabular-nums">{formatCurrency(r.payout, true)}</TableCell>
                      )}
                      {visible.revenue && (
                        <TableCell className="tabular-nums">{formatCurrency(r.revenue, true)}</TableCell>
                      )}
                      {visible.profit && (
                        <TableCell
                          className={cn(
                            "pr-6 tabular-nums",
                            profit < 0 ? "text-destructive" : "text-[color:var(--success)]",
                          )}
                        >
                          {formatCurrency(profit, true)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
              {/* Totals */}
              {rows.length > 0 && (
                <TableRow className="border-t-2 border-border bg-muted/40 hover:bg-muted/40 font-semibold">
                  <TableCell className="pl-6 text-left">Totals</TableCell>
                  {visible.live && (
                    <TableCell className="tabular-nums">{formatNumber(totals.live)}</TableCell>
                  )}
                  {visible.incoming && (
                    <TableCell className="tabular-nums">{formatNumber(totals.incoming)}</TableCell>
                  )}
                  {visible.connected && (
                    <TableCell className="tabular-nums">{formatNumber(totals.connected)}</TableCell>
                  )}
                  {visible.qualified && (
                    <TableCell className="tabular-nums">{formatNumber(totals.qualified)}</TableCell>
                  )}
                  {visible.paid && (
                    <TableCell className="tabular-nums">{formatNumber(totals.paid)}</TableCell>
                  )}
                  {visible.converted && (
                    <TableCell className="tabular-nums">{formatNumber(totals.converted)}</TableCell>
                  )}
                  {visible.noConnect && (
                    <TableCell className="tabular-nums">{formatNumber(totals.noConnect)}</TableCell>
                  )}
                  {visible.dupe && (
                    <TableCell className="tabular-nums">{formatNumber(totals.dupe)}</TableCell>
                  )}
                  {visible.conversionRate && (
                    <TableCell className="tabular-nums">
                      {formatPercent(totals.conversionRate * 100, 1)}
                    </TableCell>
                  )}
                  {visible.tcl && (
                    <TableCell className="font-mono tabular-nums">{formatTimer(totals.tcl)}</TableCell>
                  )}
                  {visible.acl && (
                    <TableCell className="font-mono tabular-nums">{formatTimer(totals.acl)}</TableCell>
                  )}
                  {visible.payout && (
                    <TableCell className="tabular-nums">{formatCurrency(totals.payout, true)}</TableCell>
                  )}
                  {visible.revenue && (
                    <TableCell className="tabular-nums">{formatCurrency(totals.revenue, true)}</TableCell>
                  )}
                  {visible.profit && (
                    <TableCell
                      className={cn(
                        "pr-6 tabular-nums",
                        totals.revenue - totals.payout < 0
                          ? "text-destructive"
                          : "text-[color:var(--success)]",
                      )}
                    >
                      {formatCurrency(totals.revenue - totals.payout, true)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
