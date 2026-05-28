"use client";

import { useMemo, useState } from "react";
import { CheckCheck, Inbox } from "lucide-react";
import { toast } from "sonner";

import { NotificationRow } from "@/components/app-shell/notification-row";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_NOTIFICATIONS, type NotificationItem } from "@/lib/mock/notifications";
import { cn } from "@/lib/utils";

type TabId = "all" | "critical" | "insights" | "read";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "all", label: "All" },
  { id: "critical", label: "Alerts" },
  { id: "insights", label: "Insights" },
  { id: "read", label: "Read" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<TabId>("all");
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const counts: Record<TabId, number> = useMemo(
    () => ({
      all: items.length,
      critical: items.filter((x) => x.severity === "critical" || x.severity === "warn").length,
      insights: items.filter((x) => x.severity === "insight").length,
      read: items.filter((x) => x.read).length,
    }),
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter((n) => {
        if (tab === "all") return true;
        if (tab === "critical") return n.severity === "critical" || n.severity === "warn";
        if (tab === "insights") return n.severity === "insight";
        return n.read;
      }),
    [items, tab],
  );

  const markAllRead = () => {
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} unread across alerts and insights.`
            : "You're all caught up."
        }
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-md border border-border bg-secondary/30 p-0.5 w-fit">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const count = counts[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "bg-secondary/60 text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Inbox className="h-7 w-7 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No notifications in this filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {filtered.map((n) => (
              <NotificationRow key={n.id} item={n} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
