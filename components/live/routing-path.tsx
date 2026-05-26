/**
 * RoutingPath — geometric, top-to-bottom routing flow.
 * Each step is a numbered node connected by an animated rail.
 */

"use client";

import { motion } from "framer-motion";
import { Building2, GitFork, Hash, PhoneIncoming, Users } from "lucide-react";

import { BracketCard } from "@/components/shared/bracket-card";
import { SectionLabel } from "@/components/shared/section-label";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "caller", label: "Caller", icon: PhoneIncoming },
  { key: "publisher", label: "Publisher", icon: Users },
  { key: "number", label: "Tracking #", icon: Hash },
  { key: "routing", label: "Routing", icon: GitFork },
  { key: "buyer", label: "Buyer", icon: Building2 },
] as const;

export function RoutingPath({ call }: { call: Call | null }) {
  return (
    <BracketCard>
      <SectionLabel
        index={3}
        title="Routing path"
        meta={call ? call.callerNumber.slice(-7) : "—"}
      />
      {!call ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/60 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Awaiting in-flight call
        </div>
      ) : (
        <ol className="relative space-y-2">
          {/* connector rail */}
          <div
            aria-hidden
            className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 via-accent/30 to-transparent"
          />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const value =
              s.key === "caller"
                ? call.callerNumber.slice(-7)
                : s.key === "publisher"
                  ? call.publisherName ?? "—"
                  : s.key === "number"
                    ? call.destinationNumber.slice(-7)
                    : s.key === "routing"
                      ? call.campaignName.split(" ").slice(0, 2).join(" ")
                      : call.buyerName ?? "Pending";
            const isCurrent =
              (s.key === "caller" && call.status === "ringing") ||
              (s.key === "buyer" && call.status === "in-progress");
            const isDone =
              s.key === "buyer" ? call.status === "completed" : true;

            return (
              <motion.li
                key={s.key}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="relative flex items-center gap-3 rounded-lg border border-border bg-card/60 p-2.5"
              >
                <span
                  className={cn(
                    "relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
                    isCurrent
                      ? "border-accent/60 bg-accent/15 text-accent"
                      : isDone
                        ? "border-[oklch(0.74_0.18_155)]/40 bg-[oklch(0.74_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]"
                        : "border-border bg-secondary/50 text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {isCurrent && (
                    <span className="absolute inset-0 -z-10 animate-ping rounded-md bg-accent/30" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-accent">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                  <p className="truncate text-sm font-medium">{value}</p>
                </div>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider",
                    isCurrent
                      ? "text-accent"
                      : isDone
                        ? "text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]"
                        : "text-muted-foreground/50",
                  )}
                >
                  {isCurrent ? "active" : isDone ? "ok" : "wait"}
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}
    </BracketCard>
  );
}
