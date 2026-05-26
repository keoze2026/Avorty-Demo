"use client";

/**
 * Vertical timeline of detected anomalies with severity-coded markers.
 * Each entry has a delta chip, scope, and an "Investigate" CTA that
 * deep-links into the appropriate detail page.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  ExternalLink,
  type LucideIcon,
  Sigma,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { MOCK_ANOMALIES } from "@/lib/mock/insights";
import { formatRelativeTime } from "@/lib/format";
import type { Anomaly, AnomalySeverity } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY: Record<
  AnomalySeverity,
  { dot: string; ring: string; chip: string; label: string }
> = {
  critical: {
    dot: "bg-destructive",
    ring: "ring-destructive/30",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
    label: "Critical",
  },
  warning: {
    dot: "bg-[color:var(--warning)]",
    ring: "ring-[color:var(--warning)]/30",
    chip: "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
    label: "Warning",
  },
  info: {
    dot: "bg-accent",
    ring: "ring-accent/30",
    chip: "border-accent/30 bg-accent/10 text-accent",
    label: "Info",
  },
};

const SCOPE_HREF = (a: Anomaly): string | undefined => {
  if (!a.scope.id) return undefined;
  if (a.scope.type === "campaign") return `${ROUTES.campaigns}/${a.scope.id}`;
  if (a.scope.type === "buyer") return `${ROUTES.buyers}/${a.scope.id}`;
  if (a.scope.type === "publisher") return `${ROUTES.publishers}/${a.scope.id}`;
  return undefined;
};

export function AnomalyStream() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-accent" />
          Anomaly stream
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <Sigma className="h-2.5 w-2.5" />
            last 24h · {MOCK_ANOMALIES.length} detected
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="relative">
          {/* Vertical line spine */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[1.25rem] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-border to-transparent"
          />

          {MOCK_ANOMALIES.map((a, i) => {
            const sev = SEVERITY[a.severity];
            const Arrow: LucideIcon = a.delta.pct >= 0 ? ArrowUp : ArrowDown;
            const href = SCOPE_HREF(a);
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="relative grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-2 px-4 py-3 transition-colors hover:bg-secondary/20"
              >
                {/* Marker */}
                <div className="relative z-10 flex items-center justify-center pt-1">
                  <span className={cn("relative inline-flex h-3 w-3 items-center justify-center rounded-full bg-card ring-4", sev.ring)}>
                    <span className={cn("h-2 w-2 rounded-full", sev.dot)} />
                  </span>
                </div>

                {/* Body */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full border px-1.5 py-0 text-[9px] font-mono uppercase tracking-wider", sev.chip)}>
                      {sev.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {a.scope.type} · {a.scope.name}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium">{a.title}</div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{a.body}</p>
                </div>

                {/* Delta + relative time */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px]",
                      sev.chip,
                    )}
                  >
                    <Arrow className="h-3 w-3" strokeWidth={3} />
                    {Math.abs(a.delta.pct)}%
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatRelativeTime(a.detectedAt)}
                  </span>
                  {href && (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground hover:text-accent"
                    >
                      Investigate
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
