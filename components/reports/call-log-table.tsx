"use client";

import * as React from "react";
import {
  Download,
  MoreVertical,
  Play,
  Search,
  Settings,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { formatCurrency, formatDuration } from "@/lib/format";
import type { Call, CallStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type ColumnKey =
  | "campaign"
  | "vendor"
  | "caller"
  | "dialed"
  | "buyer"
  | "revenue"
  | "payout"
  | "duration"
  | "status"
  | "recording";

const COLUMNS: Array<{ id: ColumnKey; label: string }> = [
  { id: "campaign", label: "Campaign" },
  { id: "vendor", label: "Vendor" },
  { id: "caller", label: "Caller ID" },
  { id: "dialed", label: "Dialed" },
  { id: "buyer", label: "Buyer" },
  { id: "revenue", label: "Revenue" },
  { id: "payout", label: "Payout" },
  { id: "duration", label: "Duration" },
  { id: "status", label: "Status" },
  { id: "recording", label: "Recording" },
];

const ALL_VISIBLE: Record<ColumnKey, boolean> = COLUMNS.reduce(
  (acc, c) => ({ ...acc, [c.id]: true }),
  {} as Record<ColumnKey, boolean>,
);

function timeLabel(ts: number) {
  const d = new Date(ts);
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${month} ${day}, ${h}:${m}:${s} ${ampm}`;
}

const STATUS_LABEL: Record<CallStatus, string> = {
  ringing: "Ringing",
  "in-progress": "Live",
  completed: "Completed",
  missed: "Missed",
  rejected: "Rejected",
  failed: "Failed",
};

function statusVariant(s: CallStatus): React.ComponentProps<typeof Badge>["variant"] {
  if (s === "completed") return "success";
  if (s === "in-progress" || s === "ringing") return "default";
  if (s === "missed") return "warning";
  return "destructive";
}

interface CallLogTableProps {
  calls: Call[];
  /** Optional limit for the visible rows (default 50). */
  limit?: number;
}

export function CallLogTable({ calls, limit = 50 }: CallLogTableProps) {
  const [query, setQuery] = React.useState("");
  const [columns, setColumns] = React.useState<Record<ColumnKey, boolean>>(ALL_VISIBLE);

  const colSpan = 2 + COLUMNS.filter((c) => columns[c.id]).length; // +Call date +actions menu
  const toggleColumn = (id: ColumnKey) =>
    setColumns((v) => ({ ...v, [id]: !v[id] }));

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...calls].sort((a, b) => b.startedAt - a.startedAt);
    const filtered = q
      ? sorted.filter((c) =>
          `${c.campaignName} ${c.publisherName ?? ""} ${c.buyerName ?? ""} ${c.callerNumber} ${c.destinationNumber}`
            .toLowerCase()
            .includes(q),
        )
      : sorted;
    return filtered.slice(0, limit);
  }, [calls, query, limit]);

  return (
    <Card className="overflow-hidden p-0">
      {/* Section title */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-6 py-4">
        <div className="text-sm font-semibold text-foreground">Call log</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search calls…"
              className="h-8 w-56 pl-7 text-xs"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Column settings">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-0">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-sm font-semibold">Columns</span>
                <button
                  type="button"
                  onClick={() => setColumns(ALL_VISIBLE)}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Show all
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto px-2 py-2">
                {COLUMNS.map((col) => {
                  const id = `log-col-${col.id}`;
                  return (
                    <Label
                      key={col.id}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-normal hover:bg-secondary/50"
                    >
                      <Checkbox
                        id={id}
                        checked={columns[col.id]}
                        onCheckedChange={() => toggleColumn(col.id)}
                      />
                      <span>{col.label}</span>
                    </Label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
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
                <TableHead className="pl-6">Call date</TableHead>
                {columns.campaign && <TableHead>Campaign</TableHead>}
                {columns.vendor && <TableHead>Vendor</TableHead>}
                {columns.caller && <TableHead>Caller ID</TableHead>}
                {columns.dialed && <TableHead>Dialed</TableHead>}
                {columns.buyer && <TableHead>Buyer</TableHead>}
                {columns.revenue && <TableHead>Revenue</TableHead>}
                {columns.payout && <TableHead>Payout</TableHead>}
                {columns.duration && <TableHead>Duration</TableHead>}
                {columns.status && <TableHead>Status</TableHead>}
                {columns.recording && <TableHead>Rec.</TableHead>}
                <TableHead className="w-12 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={colSpan} className="pl-6 py-8 text-center text-sm text-muted-foreground">
                    No matching calls.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((c) => {
                  const profit = c.revenue - c.payout;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="pl-6 whitespace-nowrap font-mono text-xs text-muted-foreground tabular-nums">
                        {timeLabel(c.startedAt)}
                      </TableCell>
                      {columns.campaign && (
                        <TableCell className="whitespace-nowrap font-medium">{c.campaignName}</TableCell>
                      )}
                      {columns.vendor && (
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {c.publisherName ?? "—"}
                        </TableCell>
                      )}
                      {columns.caller && (
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {c.callerNumber}
                        </TableCell>
                      )}
                      {columns.dialed && (
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {c.destinationNumber}
                        </TableCell>
                      )}
                      {columns.buyer && (
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {c.buyerName ?? "—"}
                        </TableCell>
                      )}
                      {columns.revenue && (
                        <TableCell className="tabular-nums">
                          {formatCurrency(c.revenue, true)}
                        </TableCell>
                      )}
                      {columns.payout && (
                        <TableCell className="tabular-nums">
                          {formatCurrency(c.payout, true)}
                          {profit !== 0 && (
                            <span
                              className={cn(
                                "ml-1 text-[10px]",
                                profit < 0 ? "text-destructive" : "text-[color:var(--success)]",
                              )}
                            >
                              ({profit < 0 ? "" : "+"}
                              {formatCurrency(profit, true)})
                            </span>
                          )}
                        </TableCell>
                      )}
                      {columns.duration && (
                        <TableCell className="font-mono tabular-nums">
                          {formatDuration(c.durationSec)}
                        </TableCell>
                      )}
                      {columns.status && (
                        <TableCell>
                          <Badge variant={statusVariant(c.status)}>{STATUS_LABEL[c.status]}</Badge>
                        </TableCell>
                      )}
                      {columns.recording && (
                        <TableCell>
                          {c.recordingUrl ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label="Play recording"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label="Call actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Copy caller ID</DropdownMenuItem>
                            <DropdownMenuItem>Block caller</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
