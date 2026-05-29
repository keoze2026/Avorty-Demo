"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { formatCompact, formatNumber } from "@/lib/format";
import { useNumbersStore } from "@/lib/store/numbers-store";
import type { NumberPool } from "@/lib/types";

/* ===========================================================
   Derived column values
   =========================================================== */

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const POOL_COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia"];
const CLOSED_BROWSER_DELAYS = [5, 10, 30, 60]; // seconds
const IDLE_LIMITS = [60, 120, 300, 600]; // seconds

export function derivePoolCountry(p: NumberPool): string {
  return POOL_COUNTRIES[hash(p.id) % POOL_COUNTRIES.length];
}

export function deriveClosedBrowserDelay(p: NumberPool): number {
  return CLOSED_BROWSER_DELAYS[hash(p.id + "cbd") % CLOSED_BROWSER_DELAYS.length];
}

export function deriveIdleLimit(p: NumberPool): number {
  return IDLE_LIMITS[hash(p.id + "idle") % IDLE_LIMITS.length];
}

export function deriveImpressions(p: NumberPool): number {
  return p.callsToday * 30 + (hash(p.id + "imp") % 5_000);
}

export function deriveMisses(p: NumberPool): number {
  return Math.round(p.callsToday * 0.04) + (hash(p.id + "miss") % 25);
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${m}m` : `${m}m ${rest}s`;
}

/* ===========================================================
   Visible-columns set
   =========================================================== */

export const POOL_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "country", label: "Country" },
  { id: "poolSize", label: "Pool size" },
  { id: "campaign", label: "Campaign" },
  { id: "closedBrowserDelay", label: "Closed browser delay" },
  { id: "idleLimit", label: "Idle limit" },
  { id: "impressions", label: "Impressions" },
  { id: "misses", label: "Misses" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions", required: true as const },
];

interface Props {
  pools: NumberPool[];
  visibleColumns: Set<string>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

export function PoolsTable({
  pools,
  visibleColumns,
  selected,
  onToggle,
  onToggleAll,
}: Props) {
  const router = useRouter();
  const setActive = useNumbersStore((s) => s.setPoolActive);
  const remove = useNumbersStore((s) => s.removePool);

  const allChecked = pools.length > 0 && pools.every((p) => selected.has(p.id));
  const colSpan = 1 + visibleColumns.size;

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 w-10 text-left">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              {visibleColumns.has("name") && (
                <TableHead className="text-left">Name</TableHead>
              )}
              {visibleColumns.has("country") && <TableHead>Country</TableHead>}
              {visibleColumns.has("poolSize") && <TableHead>Pool size</TableHead>}
              {visibleColumns.has("campaign") && (
                <TableHead className="text-left">Campaign</TableHead>
              )}
              {visibleColumns.has("closedBrowserDelay") && (
                <TableHead>Closed browser delay</TableHead>
              )}
              {visibleColumns.has("idleLimit") && <TableHead>Idle limit</TableHead>}
              {visibleColumns.has("impressions") && <TableHead>Impressions</TableHead>}
              {visibleColumns.has("misses") && <TableHead>Misses</TableHead>}
              {visibleColumns.has("status") && <TableHead>Status</TableHead>}
              <TableHead className="pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pools.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="py-10 text-center text-xs text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              pools.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-4 text-left">
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => onToggle(p.id)}
                      aria-label={`Select ${p.name}`}
                    />
                  </TableCell>
                  {visibleColumns.has("name") && (
                    <TableCell className="text-left font-medium">{p.name}</TableCell>
                  )}
                  {visibleColumns.has("country") && (
                    <TableCell className="text-muted-foreground">
                      {derivePoolCountry(p)}
                    </TableCell>
                  )}
                  {visibleColumns.has("poolSize") && (
                    <TableCell className="tabular-nums">
                      {formatNumber(p.numberCount)}
                    </TableCell>
                  )}
                  {visibleColumns.has("campaign") && (
                    <TableCell className="text-left text-xs text-muted-foreground">
                      {p.campaignName}
                    </TableCell>
                  )}
                  {visibleColumns.has("closedBrowserDelay") && (
                    <TableCell className="font-mono text-xs tabular-nums">
                      {formatSeconds(deriveClosedBrowserDelay(p))}
                    </TableCell>
                  )}
                  {visibleColumns.has("idleLimit") && (
                    <TableCell className="font-mono text-xs tabular-nums">
                      {formatSeconds(deriveIdleLimit(p))}
                    </TableCell>
                  )}
                  {visibleColumns.has("impressions") && (
                    <TableCell className="tabular-nums">
                      {formatCompact(deriveImpressions(p))}
                    </TableCell>
                  )}
                  {visibleColumns.has("misses") && (
                    <TableCell className="tabular-nums">
                      {formatNumber(deriveMisses(p))}
                    </TableCell>
                  )}
                  {visibleColumns.has("status") && (
                    <TableCell>
                      <Switch
                        checked={p.active}
                        onCheckedChange={(v) => {
                          setActive(p.id, Boolean(v));
                          toast.success(`${p.name} ${v ? "activated" : "paused"}`);
                        }}
                        aria-label={`Toggle ${p.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="pr-4">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Edit ${p.name}`}
                        onClick={() => router.push(`${ROUTES.numbers}/pools/${p.id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => {
                          remove(p.id);
                          toast.success(`Removed "${p.name}"`);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
