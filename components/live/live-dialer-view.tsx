"use client";

/**
 * Live Dialer view — agent-centric floor dashboard. Sits as a second tab
 * inside the Live Monitor page; the first tab keeps the existing call-
 * centric radar and stream views.
 *
 *   Row 1 — 6 KPI tiles (online / live / free / missed / total / sales)
 *   Row 2 — Online-agents table (max 250 rows)
 *
 * The snapshot endpoint mixes bucket-stable identity (names, daily
 * totals) with a per-4-second jitter on status, so the polling cadence
 * below keeps the page reading alive without spinning the network.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Headphones,
  PhoneCall,
  PhoneMissed,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dialerService,
  type AgentStatus,
  type DialerSnapshot,
} from "@/lib/api/services/dialer.service";
import { formatNumber, formatTimer, toE164 } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 100;

const POLL_INTERVAL_MS = 3_500;

export function LiveDialerView() {
  const [snap, setSnap] = useState<DialerSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchSnapshot = async () => {
      try {
        const next = await dialerService.snapshot();
        if (!cancelled) {
          setSnap(next);
          setLoading(false);
        }
      } catch {
        // Snapshot endpoint isn't shipped on the real backend yet; demo
        // mode is the only place this fires. On error we leave the last
        // good snapshot in place so the page doesn't flicker to empty.
        if (!cancelled) setLoading(false);
      }
    };

    void fetchSnapshot();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void fetchSnapshot();
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="space-y-4">
      <KpiRow snap={snap} loading={loading} />
      <AgentsTable agents={snap?.agents ?? []} />
    </div>
  );
}

/* ─── KPI tiles ────────────────────────────────────────────────────────── */

interface KpiDef {
  key: keyof KpiValues;
  label: string;
  icon: LucideIcon;
  /** Tile accent — drives the icon background + value color. */
  tone: "accent" | "success" | "warning" | "destructive" | "muted" | "violet";
}

interface KpiValues {
  agentsOnline: number;
  callsLive: number;
  agentsFree: number;
  callsMissed: number;
  callsTotal: number;
  sales: number;
}

const KPIS: KpiDef[] = [
  { key: "agentsOnline", label: "Agents online",        icon: Users,      tone: "accent" },
  { key: "callsLive",    label: "Calls running live",   icon: PhoneCall,  tone: "success" },
  { key: "agentsFree",   label: "Agents free",          icon: Headphones, tone: "muted" },
  { key: "callsMissed",  label: "Missed calls",         icon: PhoneMissed, tone: "destructive" },
  { key: "callsTotal",   label: "Total calls so far",   icon: Sparkles,   tone: "violet" },
  { key: "sales",        label: "Sales",                icon: CheckCircle2, tone: "success" },
];

const TONE: Record<KpiDef["tone"], { bg: string; text: string; tile: string }> = {
  accent:      { bg: "bg-accent/15",               text: "text-accent",               tile: "text-accent" },
  success:     { bg: "bg-[color:var(--success)]/15",     text: "text-[color:var(--success)]", tile: "text-[color:var(--success)]" },
  warning:     { bg: "bg-[color:var(--warning)]/15",     text: "text-[color:var(--warning)]", tile: "text-[color:var(--warning)]" },
  destructive: { bg: "bg-destructive/15",          text: "text-destructive",          tile: "text-destructive" },
  muted:       { bg: "bg-muted/40",                text: "text-muted-foreground",     tile: "text-foreground" },
  violet:      { bg: "bg-[oklch(0.6_0.2_290)]/15", text: "text-[oklch(0.6_0.2_290)] dark:text-[oklch(0.78_0.2_290)]", tile: "text-[oklch(0.6_0.2_290)] dark:text-[oklch(0.78_0.2_290)]" },
};

function KpiRow({ snap, loading }: { snap: DialerSnapshot | null; loading: boolean }) {
  const values: KpiValues = {
    agentsOnline: snap?.agentsOnline ?? 0,
    callsLive: snap?.callsLive ?? 0,
    agentsFree: snap?.agentsFree ?? 0,
    callsMissed: snap?.callsMissed ?? 0,
    callsTotal: snap?.callsTotal ?? 0,
    sales: snap?.sales ?? 0,
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {KPIS.map((k, i) => {
        const Icon = k.icon;
        const tone = TONE[k.tone];
        const value = values[k.key];
        return (
          <motion.div
            key={k.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <Card className="h-full">
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md", tone.bg, tone.text)}>
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <div className={cn("text-2xl font-semibold tabular-nums tracking-tight", tone.tile)}>
                    {loading && !snap ? "—" : formatNumber(value)}
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {k.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Agents table ─────────────────────────────────────────────────────── */

const STATUS_TONE: Record<AgentStatus, { label: string; className: string; dot: string }> = {
  on_call: {
    label: "On call",
    className: "border-[color:var(--success)]/40 bg-[color:var(--success)]/12 text-[color:var(--success)]",
    dot: "bg-[color:var(--success)]",
  },
  free: {
    label: "Available",
    className: "border-accent/40 bg-accent/12 text-accent",
    dot: "bg-accent",
  },
  wrap_up: {
    label: "Wrap up",
    className: "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
    dot: "bg-[color:var(--warning)]",
  },
  break: {
    label: "Break",
    className: "border-muted/40 bg-muted/30 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

function AgentsTable({
  agents,
}: {
  agents: DialerSnapshot["agents"];
}) {
  const [page, setPage] = useState(0);

  // Order: on-call first (most relevant), then free, then wrap_up, then break.
  // Within each status, alphabetical so the list reads predictably.
  const STATUS_ORDER: Record<AgentStatus, number> = {
    on_call: 0,
    free: 1,
    wrap_up: 2,
    break: 3,
  };
  const sorted = useMemo(() => {
    return [...agents].sort((a, b) => {
      const so = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (so !== 0) return so;
      return a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]);

  // 100 agents per page — keeps the table dense without exploding the page
  // height. Reset to page 0 when the roster swaps (e.g. bucket rollover).
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, sorted.length);
  const pageAgents = sorted.slice(start, end);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Online agents</h3>
          <p className="text-[11px] text-muted-foreground">
            {formatNumber(agents.length)} active · sorted by status · showing{" "}
            <span className="font-mono tabular-nums text-foreground">
              {sorted.length === 0 ? 0 : start + 1}–{end}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {(["on_call", "free", "wrap_up", "break"] as const).map((s) => {
            const count = agents.filter((a) => a.status === s).length;
            return (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_TONE[s].dot)} />
                {STATUS_TONE[s].label}
                <span className="text-foreground font-mono tabular-nums">{count}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div>
        <Table className="min-w-[820px]">
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[28%]">Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">Calls today</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Shift</TableHead>
              <TableHead className="text-right">Avg handle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageAgents.map((a) => {
              const tone = STATUS_TONE[a.status];
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-[10px] font-mono font-semibold text-accent">
                        {a.initials}
                      </span>
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1.5 text-[10px] uppercase tracking-wider", tone.className)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                      {tone.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.status === "on_call" && a.currentCall ? (
                      <div className="text-xs">
                        <div className="font-mono text-foreground">
                          {toE164(a.currentCall.caller)}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[18rem]">
                          {a.currentCall.campaign} · {formatTimer(a.currentCall.durationSec)}
                        </div>
                      </div>
                    ) : a.status === "break" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Coffee className="h-3 w-3" /> Away
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-xs">
                    {formatNumber(a.callsToday)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-xs text-[color:var(--success)]">
                    {formatNumber(a.salesToday)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-xs text-muted-foreground">
                    {a.shiftHours.toFixed(1)}h
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-xs text-muted-foreground">
                    {formatTimer(a.avgHandleSec)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/20 px-4 py-2.5">
          <div className="text-[11px] text-muted-foreground">
            Page <span className="font-mono tabular-nums text-foreground">{safePage + 1}</span> of{" "}
            <span className="font-mono tabular-nums text-foreground">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="h-7 px-2"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
