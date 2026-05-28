"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { CallStatusBadge } from "./call-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/format";
import type { Call } from "@/lib/types";

interface Props {
  calls: Call[];
  visibleColumns: Set<string>;
  onSelect: (call: Call) => void;
  selectedId?: string;
}

export function CallsTable({ calls, visibleColumns, onSelect, selectedId }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              {visibleColumns.has("started") && <TableHead className="w-[10%]">Started</TableHead>}
              {visibleColumns.has("caller") && <TableHead className="w-[14%]">Caller</TableHead>}
              {visibleColumns.has("campaign") && <TableHead>Campaign</TableHead>}
              {visibleColumns.has("publisher") && <TableHead>Publisher</TableHead>}
              {visibleColumns.has("buyer") && <TableHead>Buyer</TableHead>}
              {visibleColumns.has("geo") && <TableHead className="w-[6%]">Geo</TableHead>}
              {visibleColumns.has("status") && <TableHead>Status</TableHead>}
              {visibleColumns.has("duration") && <TableHead>Duration</TableHead>}
              {visibleColumns.has("payout") && <TableHead>Payout</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((c) => {
              const isSelected = selectedId === c.id;
              return (
                <motion.tr
                  key={c.id}
                  layout
                  onClick={() => onSelect(c)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-accent/10 ring-1 ring-inset ring-accent/40"
                      : "hover:bg-secondary/30"
                  }`}
                >
                  {visibleColumns.has("started") && (
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {formatRelativeTime(c.startedAt)}
                    </TableCell>
                  )}
                  {visibleColumns.has("caller") && (
                    <TableCell className="font-mono text-xs">{c.callerNumber}</TableCell>
                  )}
                  {visibleColumns.has("campaign") && (
                    <TableCell>
                      <Link
                        href={`${ROUTES.campaigns}/${c.campaignId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate text-xs transition-colors hover:text-accent"
                      >
                        {c.campaignName}
                      </Link>
                    </TableCell>
                  )}
                  {visibleColumns.has("publisher") && (
                    <TableCell className="text-xs">
                      {c.publisherId ? (
                        <Link
                          href={`${ROUTES.publishers}/${c.publisherId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="truncate transition-colors hover:text-accent"
                        >
                          {c.publisherName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.has("buyer") && (
                    <TableCell className="text-xs">
                      {c.buyerId ? (
                        <Link
                          href={`${ROUTES.buyers}/${c.buyerId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="truncate transition-colors hover:text-accent"
                        >
                          {c.buyerName}
                        </Link>
                      ) : (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.has("geo") && (
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {c.geo.state ?? "—"}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.has("status") && (
                    <TableCell>
                      <CallStatusBadge status={c.status} />
                    </TableCell>
                  )}
                  {visibleColumns.has("duration") && (
                    <TableCell className="font-mono text-xs">
                      {c.durationSec > 0 ? formatDuration(c.durationSec) : "—"}
                    </TableCell>
                  )}
                  {visibleColumns.has("payout") && (
                    <TableCell className="font-mono">
                      {c.payout > 0 ? (
                        <span className="text-foreground">{formatCurrency(c.payout, true)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
