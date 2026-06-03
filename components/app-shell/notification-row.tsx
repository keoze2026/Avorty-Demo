"use client";

import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { ALERT_KIND_DOT, SEVERITY_DOT, type NotificationItem } from "@/lib/mock/notifications";
import { cn } from "@/lib/utils";

/**
 * One notification row — used both in the topbar dropdown list and on the
 * dedicated /notifications page. Layout is identical across both surfaces.
 */
export function NotificationRow({ item }: { item: NotificationItem }) {
  const positive = (item.delta ?? 0) >= 0;
  // Prefer the fine-grained alert-kind color (missed=red / cap-over=orange
  // / low-aht=yellow) when present; fall back to the severity dot.
  const dotClass = item.alertKind
    ? ALERT_KIND_DOT[item.alertKind]
    : SEVERITY_DOT[item.severity];

  return (
    <li
      className={cn(
        "group/notif relative flex gap-3 px-4 py-3 transition-colors hover:bg-secondary/35",
        !item.read && "bg-secondary/15",
      )}
    >
      {/* Severity / alert-kind dot */}
      <span
        aria-hidden
        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotClass)}
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
