"use client";

import { MoreVertical, Pause, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { NumberStatusBadge } from "./number-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { formatCompact, formatPercent, formatRelativeTime } from "@/lib/format";
import { useNumbersStore } from "@/lib/store/numbers-store";
import type { TrackingNumber } from "@/lib/types";

export function NumbersTable({ numbers }: { numbers: TrackingNumber[] }) {
  const setStatus = useNumbersStore((s) => s.setNumberStatus);
  const remove = useNumbersStore((s) => s.removeNumber);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40">
            <TableHead>Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Geo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Calls today</TableHead>
            <TableHead className="text-right">Conv.</TableHead>
            <TableHead className="text-right">Last call</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {numbers.map((n) => {
            const isActive = n.status === "active";
            return (
              <TableRow key={n.id} className="hover:bg-secondary/30">
                <TableCell className="font-mono text-xs">{n.number}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {n.type === "tollfree" ? "Toll-free" : n.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {n.campaignId && n.campaignName ? (
                    <Link
                      href={`${ROUTES.campaigns}/${n.campaignId}`}
                      className="truncate text-foreground transition-colors hover:text-accent"
                    >
                      {n.campaignName}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {n.state ? `${n.city}, ${n.state}` : "—"}
                </TableCell>
                <TableCell>
                  <NumberStatusBadge status={n.status} />
                </TableCell>
                <TableCell className="text-right font-mono">{formatCompact(n.callsToday)}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatPercent(n.conversionRate * 100, 0)}
                </TableCell>
                <TableCell className="text-right text-xs font-mono text-muted-foreground">
                  {n.lastCallAt ? formatRelativeTime(n.lastCallAt) : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Actions">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          setStatus(n.id, isActive ? "paused" : "active");
                          toast.success(isActive ? `${n.number} paused` : `${n.number} activated`);
                        }}
                      >
                        {isActive ? (
                          <>
                            <Pause className="h-4 w-4" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          remove(n.id);
                          toast.success(`${n.number} released`);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Release number
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
