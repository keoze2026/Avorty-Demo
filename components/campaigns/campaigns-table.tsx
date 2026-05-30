"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  Pencil,
  Trash2,
  Undo2,
  User,
} from "lucide-react";

import {
  ALL_CAMPAIGN_COLUMNS,
  type CampaignColumnKey,
} from "@/components/campaigns/campaigns-toolbar";
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
import type { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CampaignsTableProps {
  campaigns: Campaign[];
  columns?: Record<CampaignColumnKey, boolean>;
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Helpers                                                             */
/* ─────────────────────────────────────────────────────────────────── */

/** Stable per-id hash so synthetic counters don't flicker across renders. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface SyntheticMetrics {
  liveCurrent: number;
  liveCap: number;
  hourly: number;
  daily: number;
  monthly: number;
  global: number;
}

/**
 * Visual-only synthetic metrics for the table appearance.
 * Stable per-id, populates the rich column layout without touching the
 * underlying Campaign type or any store.
 */
function makeMetrics(c: Campaign): SyntheticMetrics {
  const seed = hash(c.id);
  const paused = c.status === "paused" || c.status === "archived";
  const draft = c.status === "draft";

  const liveCap = c.dailyCap > 0 ? c.dailyCap : 200 + (seed % 5) * 100;
  const liveCurrent = paused || draft ? 0 : seed % Math.max(1, Math.floor(liveCap * 0.35));

  const daily = paused || draft ? 0 : c.callsToday * 4 + (seed % 50);
  const hourly = paused || draft ? 0 : Math.round(daily / Math.max(1, new Date().getHours() || 1));
  const monthly = (seed % 30000) + 2000;
  const global = monthly * (5 + (seed % 8));

  return { liveCurrent, liveCap, hourly, daily, monthly, global };
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Component                                                           */
/* ─────────────────────────────────────────────────────────────────── */

export function CampaignsTable({
  campaigns,
  columns = ALL_CAMPAIGN_COLUMNS,
  onToggle,
  onArchive,
}: CampaignsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const allChecked = campaigns.length > 0 && selected.size === campaigns.length;
  const indeterminate = selected.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked || indeterminate) setSelected(new Set());
    else setSelected(new Set(campaigns.map((c) => c.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allChecked || (indeterminate && "indeterminate")}
                  onCheckedChange={toggleAll}
                  aria-label="Select all campaigns"
                />
              </TableHead>
              {columns.progress && <TableHead>Progress</TableHead>}
              <TableHead className="text-left">Campaign</TableHead>
              {columns.access && <TableHead>Access</TableHead>}
              {columns.live && <TableHead>Live</TableHead>}
              {columns.hourly && <TableHead>Hourly</TableHead>}
              {columns.daily && <TableHead>Daily</TableHead>}
              {columns.monthly && <TableHead>Monthly</TableHead>}
              {columns.global && <TableHead>Global</TableHead>}
              {columns.status && <TableHead>Status</TableHead>}
              <TableHead className="pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => {
              const m = makeMetrics(c);
              const isActive = c.status === "active";
              const isPaused = c.status === "paused";
              return (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`${ROUTES.campaigns}/${c.id}`)}
                >
                  <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggleOne(c.id)}
                      aria-label={`Select ${c.name}`}
                    />
                  </TableCell>
                  {columns.progress && (
                    <TableCell>
                      <ProgressPill paused={isPaused} />
                    </TableCell>
                  )}
                  <TableCell className="text-left font-medium text-foreground">
                    {/* Push the Active pill to the cell's right edge so the
                        badge column reads as a clean vertical band, regardless
                        of campaign-name length. */}
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{c.name}</span>
                      {isActive && <ActiveBadge />}
                    </div>
                  </TableCell>
                  {columns.access && (
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        Public
                      </span>
                    </TableCell>
                  )}
                  {columns.live && (
                    <TableCell>
                      <LiveBox current={m.liveCurrent} cap={m.liveCap} />
                    </TableCell>
                  )}
                  {columns.hourly && (
                    <TableCell className="tabular-nums">{m.hourly}</TableCell>
                  )}
                  {columns.daily && (
                    <TableCell className="tabular-nums">{m.daily}</TableCell>
                  )}
                  {columns.monthly && (
                    <TableCell className="tabular-nums">{m.monthly.toLocaleString()}</TableCell>
                  )}
                  {columns.global && (
                    <TableCell className="tabular-nums">{m.global.toLocaleString()}</TableCell>
                  )}
                  {columns.status && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => onToggle(c.id)}
                        aria-label={isActive ? "Pause campaign" : "Activate campaign"}
                      />
                    </TableCell>
                  )}
                  <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-0.5">
                      <ActionIcon
                        icon={Pencil}
                        label="Edit"
                        onClick={() => router.push(`${ROUTES.campaigns}/${c.id}`)}
                      />
                      <ActionIcon icon={CirclePlus} label="Duplicate" />
                      <ActionIcon icon={Undo2} label="Revert" />
                      <ActionIcon
                        icon={Trash2}
                        label="Archive"
                        tone="destructive"
                        onClick={() => onArchive(c.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Subcomponents                                                       */
/* ─────────────────────────────────────────────────────────────────── */

function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.78_0.18_155)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      Active
    </span>
  );
}

function ProgressPill({ paused }: { paused: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium",
        paused
          ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
          : "bg-[color:var(--success)]/15 text-[color:var(--success)]",
      )}
    >
      {paused ? "Paused" : "Ready"}
    </span>
  );
}

function LiveBox({ current, cap }: { current: number; cap: number }) {
  return (
    <span className="inline-flex h-7 min-w-[4.5rem] items-center justify-center rounded-md border border-border bg-secondary/30 px-2 font-mono text-xs tabular-nums">
      {current} / {cap}
    </span>
  );
}

function ActionIcon({
  icon: Icon,
  label,
  onClick,
  tone = "muted",
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  tone?: "muted" | "destructive";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        tone === "destructive"
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
