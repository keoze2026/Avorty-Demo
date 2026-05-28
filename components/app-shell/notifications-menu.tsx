"use client";

import * as React from "react";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Inbox,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Severity = "critical" | "warn" | "info" | "insight";

interface NotificationItem {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  time: string;
  delta?: number;
  action?: string;
  read?: boolean;
  source?: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    severity: "critical",
    title: "Buyer Apex hit daily cap",
    body: "Routing temporarily paused. 14 calls re-routed to fallback Tier-2.",
    time: "11m",
    source: "Apex Solutions",
    delta: -32,
    action: "Raise cap",
  },
  {
    id: "n2",
    severity: "warn",
    title: "Acceptance dipped in OH / MI",
    body: "Auto Warranty acceptance is 14% over the past 48h vs 22% baseline.",
    time: "26m",
    source: "Auto Warranty",
    delta: -8.4,
    action: "Investigate",
  },
  {
    id: "n3",
    severity: "info",
    title: "Health Tier 1 spiked 24%",
    body: "Conversion is trending up over the last hour — 3 publishers contributing.",
    time: "2m",
    source: "Health Tier 1",
    delta: 24,
    action: "Scale up",
  },
  {
    id: "n4",
    severity: "insight",
    title: "AI suggests retiring 3 numbers",
    body: "Low conversion across the last 7 days — 0.3% vs network 4.1%.",
    time: "1h",
    source: "AI Insights",
    action: "Review",
  },
  {
    id: "n5",
    severity: "info",
    title: "Webhook latency normalized",
    body: "Buyer Apex webhook P95 returned to 142ms after 4h spike.",
    time: "2h",
    source: "System",
    read: true,
  },
  {
    id: "n6",
    severity: "warn",
    title: "Card expires in 9 days",
    body: "Update the primary payment method to avoid an auto-suspend.",
    time: "5h",
    source: "Billing",
    action: "Update card",
  },
];

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-destructive",
  warn: "bg-[color:var(--warning)]",
  info: "bg-accent",
  insight: "bg-[oklch(0.7_0.2_290)]",
};

type TabId = "all" | "critical" | "insights";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Alerts" },
  { id: "insights", label: "Insights" },
];

export function NotificationsMenu() {
  const [tab, setTab] = React.useState<TabId>("all");
  const [items, setItems] = React.useState(NOTIFICATIONS);

  const unread = items.filter((n) => !n.read).length;

  const counts: Record<TabId, number> = {
    all: items.length,
    critical: items.filter((x) => x.severity === "critical" || x.severity === "warn").length,
    insights: items.filter((x) => x.severity === "insight").length,
  };

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
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border border-background bg-accent px-1 text-[9px] font-bold text-accent-foreground">
              {unread}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(380px,calc(100vw-1rem))] overflow-hidden border-border bg-popover p-0"
      >
        {/* Header — title + mark-all-read */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 rounded-md border border-border bg-secondary/30 p-0.5">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              const count = counts[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] tabular-nums",
                      isActive ? "bg-accent/15 text-accent" : "bg-secondary/60 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto border-t border-border/60">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Inbox className="h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {filtered.map((n) => (
                <NotifRow key={n.id} item={n} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-secondary/20 px-2 py-1.5">
          <button className="inline-flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
            View all notifications
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotifRow({ item }: { item: NotificationItem }) {
  const positive = (item.delta ?? 0) >= 0;

  return (
    <li
      className={cn(
        "group/notif relative flex gap-3 px-4 py-3 transition-colors hover:bg-secondary/35",
        !item.read && "bg-secondary/15",
      )}
    >
      {/* Severity dot */}
      <span
        aria-hidden
        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SEVERITY_DOT[item.severity])}
      />

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h4
            className={cn(
              "truncate text-sm font-semibold leading-snug",
              item.read ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {item.title}
          </h4>
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{item.time}</span>
        </div>
        {item.source && (
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.source}</div>
        )}
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/90">{item.body}</p>

        {(typeof item.delta === "number" || item.action) && (
          <div className="mt-2 flex items-center gap-2">
            {typeof item.delta === "number" && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  positive
                    ? "bg-[color:var(--success)]/12 text-[color:var(--success)]"
                    : "bg-destructive/12 text-destructive",
                )}
              >
                {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {positive ? "+" : ""}
                {item.delta.toFixed(1)}%
              </span>
            )}
            {item.action && (
              <button
                type="button"
                className="ml-auto inline-flex items-center gap-1 rounded-md border border-border/70 bg-card px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-accent/45 hover:text-accent"
              >
                {item.severity === "insight" && <Sparkles className="h-3 w-3" />}
                {item.action}
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
