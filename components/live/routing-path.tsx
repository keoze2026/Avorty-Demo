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
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground">
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
                    "relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                    isCurrent
                      ? "bg-accent/15 text-accent"
                      : isDone
                        ? "bg-[color:var(--success)]/12 text-[color:var(--success)]"
                        : "bg-secondary/50 text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {isCurrent && (
                    <span className="absolute inset-0 -z-10 animate-ping rounded-md bg-accent/30" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  <p className="truncate text-sm font-medium">{value}</p>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    isCurrent
                      ? "text-accent"
                      : isDone
                        ? "text-[color:var(--success)]"
                        : "text-muted-foreground/60",
                  )}
                >
                  {isCurrent ? "Active" : isDone ? "Done" : "Waiting"}
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}
    </BracketCard>
  );
}
