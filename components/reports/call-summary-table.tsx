"use client";

import * as React from "react";
import { Download, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Call } from "@/lib/types";
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

interface CallSummaryTableProps {
  calls: Call[];
}

export function CallSummaryTable({ calls }: CallSummaryTableProps) {
  const [tab, setTab] = React.useState<GroupKey>("campaign");
  const rows = React.useMemo(() => groupCalls(calls, tab), [calls, tab]);
  const totals = React.useMemo(() => totalsOf(rows), [rows]);

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
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Column settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">{TABS.find((t) => t.id === tab)?.label}</TableHead>
                <TableHead className="text-right">Live</TableHead>
                <TableHead className="text-right">Incoming</TableHead>
                <TableHead className="text-right">Connected</TableHead>
                <TableHead className="text-right">Qualified</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Converted</TableHead>
                <TableHead className="text-right">No connect</TableHead>
                <TableHead className="text-right">Dupe</TableHead>
                <TableHead className="text-right">Conv. rate</TableHead>
                <TableHead className="text-right">TCL</TableHead>
                <TableHead className="text-right">ACL</TableHead>
                <TableHead className="text-right">Payout</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="pr-6 text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={15} className="pl-6 py-6 text-sm text-muted-foreground">
                    No calls in this range.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const profit = r.revenue - r.payout;
                  return (
                    <TableRow key={r.key}>
                      <TableCell className="pl-6 font-medium">{r.label}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.live)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.incoming)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.connected)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.qualified)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.paid)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.converted)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.noConnect)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(r.dupe)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(r.conversionRate * 100, 1)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatTimer(r.tcl)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatTimer(r.acl)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(r.payout, true)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(r.revenue, true)}</TableCell>
                      <TableCell
                        className={cn(
                          "pr-6 text-right tabular-nums",
                          profit < 0 ? "text-destructive" : "text-[color:var(--success)]",
                        )}
                      >
                        {formatCurrency(profit, true)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {/* Totals */}
              {rows.length > 0 && (
                <TableRow className="border-t-2 border-border bg-muted/40 hover:bg-muted/40 font-semibold">
                  <TableCell className="pl-6">Totals</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.live)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.incoming)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.connected)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.qualified)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.paid)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.converted)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.noConnect)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.dupe)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPercent(totals.conversionRate * 100, 1)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatTimer(totals.tcl)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatTimer(totals.acl)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(totals.payout, true)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(totals.revenue, true)}</TableCell>
                  <TableCell
                    className={cn(
                      "pr-6 text-right tabular-nums",
                      totals.revenue - totals.payout < 0
                        ? "text-destructive"
                        : "text-[color:var(--success)]",
                    )}
                  >
                    {formatCurrency(totals.revenue - totals.payout, true)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
