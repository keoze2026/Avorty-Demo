"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, ChevronRight, Inbox } from "lucide-react";

import { NotificationRow } from "@/components/app-shell/notification-row";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";
import { MOCK_NOTIFICATIONS, type NotificationItem } from "@/lib/mock/notifications";
import { cn } from "@/lib/utils";

type TabId = "all" | "critical" | "insights";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Alerts" },
  { id: "insights", label: "Insights" },
];

/** Cap on the topbar dropdown — the full set lives on /notifications. */
const POPUP_LIMIT = 6;

export function NotificationsMenu() {
  const [tab, setTab] = React.useState<TabId>("all");
  const [items, setItems] = React.useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const unread = items.filter((n) => !n.read).length;

  const counts: Record<TabId, number> = {
    all: items.length,
    critical: items.filter((x) => x.severity === "critical" || x.severity === "warn").length,
    insights: items.filter((x) => x.severity === "insight").length,
  };

  const filtered = items
    .filter((n) => {
      if (tab === "all") return true;
      if (tab === "critical") return n.severity === "critical" || n.severity === "warn";
      return n.severity === "insight";
    })
    .slice(0, POPUP_LIMIT);

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
        {/* Header */}
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
                <NotificationRow key={n.id} item={n} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer — link to the full page */}
        <div className="border-t border-border/60 bg-secondary/20 px-2 py-1.5">
          <Link
            href={ROUTES.notifications}
            className="inline-flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          >
            View all notifications
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
