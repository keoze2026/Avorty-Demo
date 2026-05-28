"use client";

import { Hash, Plus } from "lucide-react";

import { NumberStatusBadge } from "@/components/numbers/number-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompact, formatPercent, formatRelativeTime } from "@/lib/format";
import { useNumbersStore } from "@/lib/store/numbers-store";

/**
 * Publisher-attached numbers tab.
 * The store doesn't currently track per-publisher assignment, so we approximate
 * by hashing the publisher id to a stable slice of the DID inventory — enough
 * to give the page substance until publisher-level number routing ships.
 */
export function PublisherNumbersTab({ publisherId }: { publisherId: string }) {
  const allNumbers = useNumbersStore((s) => s.numbers);

  // Stable, deterministic per-publisher slice
  const hash = [...publisherId].reduce((s, c) => s + c.charCodeAt(0), 0);
  const slice = allNumbers
    .filter((n) => n.campaignId)
    .filter((_, i) => (i + hash) % 3 === 0)
    .slice(0, 8);

  if (slice.length === 0) {
    return (
      <EmptyState
        icon={Hash}
        tone="cyan"
        title="No numbers assigned"
        description="Provision tracking numbers and route them through this publisher to start collecting traffic."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Provision number
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40">
            <TableHead>Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Calls today</TableHead>
            <TableHead>Conv.</TableHead>
            <TableHead>Last call</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slice.map((n) => (
            <TableRow key={n.id} className="hover:bg-secondary/30">
              <TableCell className="font-mono text-xs">{n.number}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {n.type === "tollfree" ? "Toll-free" : n.type}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {n.campaignName ?? "—"}
              </TableCell>
              <TableCell>
                <NumberStatusBadge status={n.status} />
              </TableCell>
              <TableCell className="font-mono">{formatCompact(n.callsToday)}</TableCell>
              <TableCell className="font-mono text-xs">
                {formatPercent(n.conversionRate * 100, 0)}
              </TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground">
                {n.lastCallAt ? formatRelativeTime(n.lastCallAt) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
