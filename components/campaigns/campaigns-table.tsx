"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, MoreVertical, Pause, Play } from "lucide-react";

import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { Campaign } from "@/lib/types";

interface CampaignsTableProps {
  campaigns: Campaign[];
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
}

export function CampaignsTable({ campaigns, onToggle, onArchive }: CampaignsTableProps) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Calls today</TableHead>
            <TableHead className="text-right">Revenue today</TableHead>
            <TableHead className="text-right">Conv. rate</TableHead>
            <TableHead className="text-right">Payout</TableHead>
            <TableHead className="w-12 pr-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => {
            const isActive = c.status === "active";
            const isArchived = c.status === "archived";
            return (
              <TableRow
                key={c.id}
                className="cursor-pointer"
                onClick={() => router.push(`${ROUTES.campaigns}/${c.id}`)}
              >
                <TableCell className="pl-6">
                  <Link
                    href={`${ROUTES.campaigns}/${c.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block font-medium transition-colors hover:text-accent"
                  >
                    {c.name}
                  </Link>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.vertical}</div>
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={c.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(c.callsToday)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(c.revenueToday)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPercent(c.conversionRate * 100, 0)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(c.payout, true)}
                </TableCell>
                <TableCell className="pr-6">
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Campaign actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => router.push(`${ROUTES.campaigns}/${c.id}`)}
                        >
                          View details
                        </DropdownMenuItem>
                        {!isArchived && (
                          <DropdownMenuItem onSelect={() => onToggle(c.id)}>
                            {isActive ? (
                              <>
                                <Pause className="h-3.5 w-3.5" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onArchive(c.id)}
                        >
                          <Archive className="h-3.5 w-3.5" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
