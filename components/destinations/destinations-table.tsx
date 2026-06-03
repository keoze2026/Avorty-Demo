"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";
import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { formatNumber, toE164 } from "@/lib/format";
import type { Buyer, Destination } from "@/lib/types";
import { cn } from "@/lib/utils";

type CapField = "concurrencyCap" | "dailyCap" | "monthlyCap";

interface DestinationsTableProps {
  destinations: Destination[];
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdateCap?: (id: string, field: CapField, value: number) => void;
  /** Optional selection lifted to the parent — when provided, renders a
   *  checkbox column. Without it, no checkboxes are shown. */
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
}

interface Row {
  destination: Destination;
  buyer: Buyer | undefined;
  live: number;
  hourly: number;
  daily: number;
  monthly: number;
  global: number;
}

/**
 * Counts calls per destination TFN at five different windows:
 *   live    — currently ringing or in-progress (any time)
 *   hourly  — calls started in the current hour
 *   daily   — calls started today (since 00:00 local)
 *   monthly — calls started this month (since the 1st)
 *   global  — all calls ever recorded for this TFN
 */
function buildRows(destinations: Destination[]): Row[] {
  const now = new Date();
  const startOfHour = new Date(now);
  startOfHour.setMinutes(0, 0, 0);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfDayMs = startOfDay.getTime();
  const startOfHourMs = startOfHour.getTime();

  const live = new Map<string, number>();
  const hourly = new Map<string, number>();
  const daily = new Map<string, number>();
  const monthly = new Map<string, number>();
  const global = new Map<string, number>();

  for (const c of MOCK_CALLS) {
    const tfn = c.destinationNumber;
    global.set(tfn, (global.get(tfn) ?? 0) + 1);
    if (c.startedAt >= startOfMonth) monthly.set(tfn, (monthly.get(tfn) ?? 0) + 1);
    if (c.startedAt >= startOfDayMs) daily.set(tfn, (daily.get(tfn) ?? 0) + 1);
    if (c.startedAt >= startOfHourMs) hourly.set(tfn, (hourly.get(tfn) ?? 0) + 1);
    if (c.status === "ringing" || c.status === "in-progress") {
      live.set(tfn, (live.get(tfn) ?? 0) + 1);
    }
  }

  const buyerById = new Map<string, Buyer>();
  for (const b of MOCK_BUYERS) buyerById.set(b.id, b);

  return destinations.map<Row>((destination) => ({
    destination,
    buyer: buyerById.get(destination.buyerId),
    live: live.get(destination.tfn) ?? 0,
    hourly: hourly.get(destination.tfn) ?? 0,
    daily: daily.get(destination.tfn) ?? 0,
    monthly: monthly.get(destination.tfn) ?? 0,
    global: global.get(destination.tfn) ?? 0,
  }));
}

/** Color a cell based on the fraction used (0..1). */
function pacingTone(pct: number): string {
  if (pct >= 1) return "text-destructive";
  if (pct >= 0.85) return "text-[color:var(--warning)]";
  return "";
}

export function DestinationsTable({
  destinations,
  onToggle,
  onUpdateCap,
  selectedIds,
  onSelectionChange,
}: DestinationsTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const rows = useMemo(() => buildRows(destinations), [destinations]);

  const selectable = !!onSelectionChange;
  const visibleIds = destinations.map((d) => d.id);
  const allChecked =
    selectable &&
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds?.has(id));
  const someChecked =
    selectable &&
    !allChecked &&
    visibleIds.some((id) => selectedIds?.has(id));

  const toggleAll = (next: boolean) => {
    if (!onSelectionChange) return;
    const out = new Set(selectedIds ?? []);
    for (const id of visibleIds) {
      if (next) out.add(id);
      else out.delete(id);
    }
    onSelectionChange(out);
  };

  const toggleRow = (id: string, next: boolean) => {
    if (!onSelectionChange) return;
    const out = new Set(selectedIds ?? []);
    if (next) out.add(id);
    else out.delete(id);
    onSelectionChange(out);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-10 pl-6 pr-0">
                  <Checkbox
                    checked={
                      allChecked ? true : someChecked ? "indeterminate" : false
                    }
                    onCheckedChange={(v) => toggleAll(v === true)}
                    aria-label={t("common.bulk.selectAllAria")}
                  />
                </TableHead>
              )}
              <TableHead className={cn("text-left uppercase tracking-wider text-[11px]", !selectable && "pl-6")}>
                {t("networkUI.destinations.table.name")}
              </TableHead>
              <TableHead className="text-left uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.buyer")}
              </TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.destination")}
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.live")}
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.hourly")}
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.daily")}
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.monthly")}
              </TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.global")}
              </TableHead>
              <TableHead className="pr-6 text-center uppercase tracking-wider text-[11px]">
                {t("networkUI.destinations.table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={selectable ? 10 : 9}
                  className="pl-6 py-10 text-center text-sm text-muted-foreground"
                >
                  {t("networkUI.destinations.table.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ destination, buyer, live, hourly, daily, monthly, global }) => {
                const livePct =
                  destination.concurrencyCap > 0
                    ? live / destination.concurrencyCap
                    : 0;
                const dailyPct =
                  destination.dailyCap > 0 ? daily / destination.dailyCap : 0;
                const monthlyPct =
                  destination.monthlyCap > 0 ? monthly / destination.monthlyCap : 0;
                const atCap = dailyPct >= 1 || livePct >= 1;

                const checked = !!selectedIds?.has(destination.id);
                return (
                  <TableRow
                    key={destination.id}
                    className="cursor-pointer"
                    data-state={checked ? "selected" : undefined}
                    onClick={() =>
                      router.push(`${ROUTES.destinations}/${destination.id}`)
                    }
                  >
                    {selectable && (
                      <TableCell
                        className="w-10 pl-6 pr-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleRow(destination.id, v === true)}
                          aria-label={t("common.bulk.selectRowAria").replace(
                            "{name}",
                            destination.name,
                          )}
                        />
                      </TableCell>
                    )}
                    {/* NAME */}
                    <TableCell className={cn("text-left", !selectable && "pl-6")}>
                      <Link
                        href={`${ROUTES.destinations}/${destination.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 font-medium transition-colors hover:text-accent"
                      >
                        <span className="truncate max-w-[14rem]">{destination.name}</span>
                        {atCap && (
                          <AlertTriangle
                            className="h-3.5 w-3.5 text-[color:var(--warning)]"
                            aria-label={t("networkUI.destinations.table.atCapAria")}
                          />
                        )}
                      </Link>
                    </TableCell>

                    {/* BUYER */}
                    <TableCell className="text-left">
                      {buyer ? (
                        <Link
                          href={`${ROUTES.buyers}/${buyer.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm transition-colors hover:text-accent"
                        >
                          {buyer.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* DESTINATION (TFN, E.164 dial-string) */}
                    <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                      {toE164(destination.tfn)}
                    </TableCell>

                    {/* LIVE — current concurrent / max (cap is click-to-edit) */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={cn(
                          "inline-flex min-w-[3.5rem] items-center justify-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums",
                          pacingTone(livePct),
                        )}
                      >
                        <span>{live}</span>
                        <span className="opacity-50">/</span>
                        <EditableCap
                          value={destination.concurrencyCap}
                          onCommit={(next) =>
                            onUpdateCap?.(destination.id, "concurrencyCap", next)
                          }
                          ariaLabel={t(
                            "networkUI.destinations.table.editConcurrencyCapAria",
                          ).replace("{name}", destination.name)}
                        />
                      </span>
                    </TableCell>

                    {/* HOURLY — just the count */}
                    <TableCell className="text-center">
                      <span className="inline-flex min-w-[3rem] items-center justify-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums">
                        {formatNumber(hourly)}
                      </span>
                    </TableCell>

                    {/* DAILY — count / cap (cap is click-to-edit, 0 = ∞) */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={cn(
                          "inline-flex min-w-[3rem] items-center justify-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums",
                          pacingTone(dailyPct),
                        )}
                      >
                        <span>{formatNumber(daily)}</span>
                        <span className="opacity-50">/</span>
                        <EditableCap
                          value={destination.dailyCap}
                          onCommit={(next) =>
                            onUpdateCap?.(destination.id, "dailyCap", next)
                          }
                          ariaLabel={t(
                            "networkUI.destinations.table.editDailyCapAria",
                          ).replace("{name}", destination.name)}
                        />
                      </span>
                    </TableCell>

                    {/* MONTHLY — count / cap (cap is click-to-edit, 0 = ∞) */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={cn(
                          "inline-flex min-w-[3rem] items-center justify-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums",
                          pacingTone(monthlyPct),
                        )}
                      >
                        <span>{formatNumber(monthly)}</span>
                        <span className="opacity-50">/</span>
                        <EditableCap
                          value={destination.monthlyCap}
                          onCommit={(next) =>
                            onUpdateCap?.(destination.id, "monthlyCap", next)
                          }
                          ariaLabel={t(
                            "networkUI.destinations.table.editMonthlyCapAria",
                          ).replace("{name}", destination.name)}
                        />
                      </span>
                    </TableCell>

                    {/* GLOBAL — lifetime count */}
                    <TableCell className="text-center">
                      <span className="inline-flex min-w-[3rem] items-center justify-center rounded border border-border bg-muted/40 px-2 py-1 font-mono text-xs tabular-nums">
                        {formatNumber(global)}
                      </span>
                    </TableCell>

                    {/* STATUS — switch */}
                    <TableCell className="pr-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={destination.enabled}
                        onCheckedChange={() => onToggle?.(destination.id)}
                        aria-label={
                          destination.enabled
                            ? t("networkUI.destinations.table.disableAria").replace("{name}", destination.name)
                            : t("networkUI.destinations.table.enableAria").replace("{name}", destination.name)
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  EditableCap                                                         */
/*  ----------------------------------------------------------------    */
/*  Click-to-edit cap number rendered inline inside the cell chip. The  */
/*  display state shows the cap (or ∞ when 0); clicking swaps in a tiny */
/*  numeric input that commits on Enter/blur and reverts on Escape. The */
/*  parent cell stops row-click propagation so editing never navigates. */
/* ─────────────────────────────────────────────────────────────────── */

function EditableCap({
  value,
  onCommit,
  ariaLabel,
}: {
  value: number;
  onCommit: (next: number) => void;
  ariaLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Reflect prop changes (e.g. store update from another surface) while idle.
  useEffect(() => {
    if (!editing) setDraft(value.toString());
  }, [value, editing]);

  const commit = () => {
    const parsed = Math.max(0, Math.floor(Number(draft) || 0));
    if (parsed !== value) onCommit(parsed);
    setDraft(parsed.toString());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value.toString());
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label={ariaLabel}
        className="w-14 rounded border border-accent/50 bg-background px-1 py-0.5 text-center font-mono text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-accent"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setDraft(value.toString());
        setEditing(true);
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="cursor-text rounded px-1 font-mono text-xs tabular-nums transition-colors hover:bg-accent/10 hover:ring-1 hover:ring-accent/40"
    >
      {value > 0 ? formatNumber(value) : "∞"}
    </button>
  );
}
