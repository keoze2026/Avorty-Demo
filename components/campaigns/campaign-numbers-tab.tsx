"use client";

import { useMemo } from "react";
import { Hash, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNumbersStore } from "@/lib/store/numbers-store";
import { formatCompact, formatPercent, formatRelativeTime } from "@/lib/format";

export function CampaignNumbersTab({ campaignId }: { campaignId: string }) {
  // See campaign-buyers-tab — filtering inside the Zustand selector returns a
  // fresh array on every render and causes React error #185 (infinite loop).
  const allNumbers = useNumbersStore((s) => s.numbers);
  const numbers = useMemo(
    () => (allNumbers ?? []).filter((n) => n.campaignId === campaignId),
    [allNumbers, campaignId],
  );

  if (numbers.length === 0) {
    return (
      <EmptyState
        icon={Hash}
        tone="violet"
        title="No numbers assigned"
        description="Provision a tracking number or attach an existing pool to start routing calls."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Attach number
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
            <TableHead>Geo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Calls today</TableHead>
            <TableHead>Conv.</TableHead>
            <TableHead>Last call</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {numbers.map((n) => (
            <TableRow key={n.id} className="hover:bg-secondary/30">
              <TableCell className="font-mono text-xs">{n.number}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {n.type}
                </Badge>
              </TableCell>
              <TableCell className="text-xs font-mono">
                {n.state ? `${n.city}, ${n.state}` : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={n.status === "active" ? "success" : n.status === "paused" ? "warning" : "outline"}
                  className="capitalize"
                >
                  {n.status}
                </Badge>
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
