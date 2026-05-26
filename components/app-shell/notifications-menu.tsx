"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCheck,
  Filter,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────── */
/*  Data                                                                */
/* ─────────────────────────────────────────────────────────────────── */

type Severity = "critical" | "warn" | "info" | "insight";
type Category = "alert" | "system" | "insight" | "billing";

interface NotificationItem {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  body: string;
  /** "2m", "11m", "1h" — already-formatted */
  time: string;
  /** Optional KPI delta (% change) shown on the right */
  delta?: number;
  /** Optional action label */
  action?: string;
  /** Mark as already read */
  read?: boolean;
  /** Source label (campaign, buyer, etc.) */
  source?: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    severity: "critical",
    category: "alert",
    title: "Buyer Apex hit daily cap",
    body: "Routing temporarily paused. 14 calls re-routed to fallback Tier-2.",
    time: "11m",
    source: "Buyer · Apex Solutions",
    delta: -32,
    action: "Raise cap",
  },
  {
    id: "n2",
    severity: "warn",
    category: "alert",
    title: "Acceptance dipped in OH / MI",
    body: "Auto Warranty acceptance is 14% over the past 48h vs 22% baseline.",
    time: "26m",
    source: "Campaign · Auto Warranty",
    delta: -8.4,
    action: "Investigate",
  },
  {
    id: "n3",
    severity: "info",
    category: "insight",
    title: "Health Tier 1 spiked 24%",
    body: "Conversion is trending up over the last hour — 3 publishers contributing.",
    time: "2m",
    source: "Campaign · Health Tier 1",
    delta: +24,
    action: "Scale up",
  },
  {
    id: "n4",
    severity: "insight",
    category: "insight",
    title: "AI suggests retiring 3 numbers",
    body: "Low conversion across the last 7 days — 0.3% vs network 4.1%.",
    time: "1h",
    source: "AI Insights",
    action: "Review",
  },
  {
    id: "n5",
    severity: "info",
    category: "system",
    title: "Webhook latency normalized",
    body: "Buyer Apex webhook P95 returned to 142ms after 4h spike.",
    time: "2h",
    source: "System · Webhooks",
    read: true,
  },
  {
    id: "n6",
    severity: "warn",
    category: "billing",
    title: "Card expires in 9 days",
    body: "Update the primary payment method to avoid an auto-suspend.",
    time: "5h",
    source: "Billing",
    action: "Update card",
  },
];

/* 24-bucket sparkline of alert frequency (deterministic LCG). */
const ALERT_SPARK = Array.from({ length: 24 }, (_, i) => {
  const v = Math.round(2 + 5 * Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2) + ((i * 1103) % 7));
  return { i, v };
});

/* ─────────────────────────────────────────────────────────────────── */
/*  Visual tokens                                                       */
/* ─────────────────────────────────────────────────────────────────── */

const SEVERITY_META: Record<
  Severity,
  { label: string; tone: string; chip: string; rail: string; ringTone: string }
> = {
  critical: {
    label: "CRIT",
    tone: "text-destructive",
    chip: "border-destructive/45 bg-destructive/10 text-destructive",
    rail: "bg-destructive",
    ringTone: "ring-destructive/40",
  },
  warn: {
    label: "WARN",
    tone: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    chip:
      "border-[oklch(0.6_0.16_75)]/45 bg-[oklch(0.6_0.16_75)]/10 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    rail: "bg-[oklch(0.6_0.16_75)]",
    ringTone: "ring-[oklch(0.6_0.16_75)]/40",
  },
  info: {
    label: "INFO",
    tone: "text-accent",
    chip: "border-accent/45 bg-accent/10 text-accent",
    rail: "bg-accent",
    ringTone: "ring-accent/40",
  },
  insight: {
    label: "AI",
    tone: "text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
    chip:
      "border-[oklch(0.6_0.2_290)]/45 bg-[oklch(0.6_0.2_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
    rail: "bg-[oklch(0.6_0.2_290)]",
    ringTone: "ring-[oklch(0.6_0.2_290)]/40",
  },
};

type TabId = "all" | "critical" | "insights";

const TABS: Array<{ id: TabId; label: string; count?: (n: NotificationItem[]) => number }> = [
  { id: "all", label: "All", count: (n) => n.length },
  {
    id: "critical",
    label: "Critical",
    count: (n) => n.filter((x) => x.severity === "critical" || x.severity === "warn").length,
  },
  {
    id: "insights",
    label: "Insights",
    count: (n) => n.filter((x) => x.severity === "insight").length,
  },
];

/* ─────────────────────────────────────────────────────────────────── */
/*  Component                                                           */
/* ─────────────────────────────────────────────────────────────────── */

export function NotificationsMenu() {
  const [tab, setTab] = React.useState<TabId>("all");
  const [items, setItems] = React.useState(NOTIFICATIONS);

  const unread = items.filter((n) => !n.read).length;
  const critical = items.filter((n) => n.severity === "critical").length;

  const filtered = items.filter((n) => {
    if (tab === "all") return true;
    if (tab === "critical") return n.severity === "critical" || n.severity === "warn";
    return n.severity === "insight";
  });

  const markAllRead = () => setItems((arr) => arr.map((n) => ({ ...n, read: true })));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border border-background bg-accent px-1 font-mono text-[9px] font-bold text-accent-foreground">
              {unread}
            </span>
          )}
          {critical > 0 && (
            <span className="absolute right-0.5 top-0.5 inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-70" />
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(420px,calc(100vw-1rem))] overflow-hidden border-border bg-card p-0"
      >
        {/* ─── Header ─── */}
        <header className="relative overflow-hidden border-b border-border/70">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
            style={{ background: "var(--vortyx-glow)" }}
          />
          {/* Hex motif */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-hex-dot opacity-30" />
          {/* Top accent rule */}
          <div aria-hidden className="absolute inset-x-6 top-0 h-px edge-rule-top" />
          {/* Corner crosshairs */}
          <Crosshair className="left-2 top-2" />
          <Crosshair className="right-2 top-2" />

          <div className="relative flex items-center gap-3 px-4 pt-4 pb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-accent/45 bg-accent/10 text-accent">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                <span>●</span>
                <span>ALERT CONSOLE</span>
                <span className="ml-auto text-muted-foreground/80">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <h3 className="mt-0.5 font-mono text-sm font-bold tracking-tight">
                <span className="tabular-nums">{unread}</span>
                <span className="text-muted-foreground"> unread · </span>
                <span className="text-destructive">{critical}</span>
                <span className="text-muted-foreground"> critical</span>
              </h3>
            </div>
          </div>

          {/* Spark + counters strip */}
          <div className="relative grid grid-cols-3 gap-0 border-t border-border/60">
            <Counter label="Crit" value={items.filter((n) => n.severity === "critical").length} tone="destructive" />
            <Counter label="Warn" value={items.filter((n) => n.severity === "warn").length} tone="amber" />
            <Counter label="AI" value={items.filter((n) => n.severity === "insight").length} tone="violet" />
          </div>

          {/* Sparkline strip */}
          <div className="relative h-10 border-t border-border/60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ALERT_SPARK} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="notif-spark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  fill="url(#notif-spark)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 bottom-0.5 flex justify-between px-2 font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground/60">
              <span>24h alert rate</span>
              <span>peak {Math.max(...ALERT_SPARK.map((p) => p.v))}/h</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="relative flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
            <div className="flex gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5">
              {TABS.map((t) => {
                const isActive = tab === t.id;
                const count = t.count?.(items);
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card",
                      isActive
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.label}
                    {typeof count === "number" && (
                      <span
                        className={cn(
                          "rounded-full px-1 font-mono text-[9px] tabular-nums",
                          isActive ? "bg-accent/15 text-accent" : "bg-secondary/70 text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent"
            >
              <CheckCheck className="h-3 w-3" />
              mark all read
            </button>
          </div>
        </header>

        {/* ─── List ─── */}
        <div className="max-h-[420px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                No alerts in this filter
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {filtered.map((n) => (
                <NotifRow key={n.id} item={n} />
              ))}
            </ul>
          )}
        </div>

        {/* ─── Footer ─── */}
        <footer className="relative border-t border-border/70 bg-secondary/20">
          <div aria-hidden className="absolute inset-x-6 top-0 h-px edge-rule-top opacity-60" />
          <div className="flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-count-tick" />
              live feed
            </span>
            <button className="inline-flex items-center gap-1 transition-colors hover:text-accent">
              view all
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </footer>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Subcomponents                                                       */
/* ─────────────────────────────────────────────────────────────────── */

function NotifRow({ item }: { item: NotificationItem }) {
  const meta = SEVERITY_META[item.severity];
  const positive = (item.delta ?? 0) >= 0;

  return (
    <li
      className={cn(
        "group/notif relative flex gap-3 px-3 py-3 transition-colors hover:bg-secondary/35",
        !item.read && "bg-secondary/15",
      )}
    >
      {/* Severity rail */}
      <span aria-hidden className={cn("absolute inset-y-2 left-0 w-[2px] rounded-full", meta.rail)} />

      {/* Unread dot */}
      {!item.read && (
        <span
          aria-hidden
          className={cn(
            "absolute right-3 top-3 inline-flex h-1.5 w-1.5 rounded-full",
            meta.rail,
          )}
        />
      )}

      {/* Severity chip */}
      <span
        className={cn(
          "ml-2 inline-flex h-7 shrink-0 flex-col items-center justify-center rounded-md border px-1.5 font-mono text-[9px] font-semibold tracking-[0.15em]",
          meta.chip,
        )}
      >
        {meta.label}
      </span>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.source && (
            <span className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {item.source}
            </span>
          )}
          <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            {item.time}
          </span>
        </div>
        <h4
          className={cn(
            "mt-1 truncate text-sm font-semibold leading-snug",
            item.read && "text-muted-foreground",
          )}
        >
          {item.title}
        </h4>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{item.body}</p>

        {/* Footer row — delta + action */}
        {(typeof item.delta === "number" || item.action) && (
          <div className="mt-2 flex items-center justify-between gap-2">
            {typeof item.delta === "number" ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                  positive
                    ? "border-[oklch(0.74_0.18_155)]/40 bg-[oklch(0.74_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]"
                    : "border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {positive ? "+" : ""}
                {item.delta.toFixed(1)}%
              </span>
            ) : (
              <span />
            )}
            {item.action && (
              <button
                type="button"
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded border px-2 font-mono text-[10px] uppercase tracking-wider transition-colors",
                  "border-border/80 bg-card text-muted-foreground hover:border-accent/45 hover:text-accent",
                )}
              >
                {item.severity === "insight" ? <Sparkles className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {item.action}
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "destructive" | "amber" | "violet";
}) {
  const tones: Record<typeof tone, string> = {
    destructive: "text-destructive",
    amber: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    violet: "text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
  };
  return (
    <div className="border-r border-border/60 px-3 py-2 last:border-r-0">
      <div className={cn("font-mono text-lg font-bold tabular-nums leading-none", tones[tone])}>
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-2 w-2",
        "before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-accent/55",
        "after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-translate-y-1/2 after:bg-accent/55",
        className,
      )}
    />
  );
}
