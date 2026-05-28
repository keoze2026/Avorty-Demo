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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
                <TableHead className="pl-6">Call date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Caller ID</TableHead>
                <TableHead>Dialed</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Payout</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rec.</TableHead>
                <TableHead className="w-12 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={12} className="pl-6 py-8 text-center text-sm text-muted-foreground">
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
                      <TableCell className="whitespace-nowrap font-medium">{c.campaignName}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {c.publisherName ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {c.callerNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {c.destinationNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {c.buyerName ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(c.revenue, true)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
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
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatDuration(c.durationSec)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(c.status)}>{STATUS_LABEL[c.status]}</Badge>
                      </TableCell>
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
