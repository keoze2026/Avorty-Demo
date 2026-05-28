"use client";

/**
 * Problem → Solution section.
 * Side-by-side comparison: the legacy stack vs Vortyx.
 * Quiet typography, single accent on the "after" card.
 */

import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";

const oldStack = [
  "Five tools to track, route, qualify, bill, and report",
  "Routing changes take engineering tickets",
  "Reports update overnight, not by minute",
  "Compliance is somebody else's spreadsheet",
  "Buyers and publishers see different numbers",
];

const newStack = [
  "One control plane from ring to settlement",
  "Visual ring-tree editor anyone on your team can run",
  "Sub-second analytics, drillable down to the call",
  "TCPA & HIPAA built in, audit-ready by default",
  "Shared source of truth across the whole network",
];

export function ProblemSolution() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Stop gluing five tools together.
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Legacy call tracking is a graveyard of admin UIs, CSV exports, and stale dashboards.
            Vortyx puts the whole network in one live pane.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
          {/* The old stack */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl border border-border/60 bg-card/40 p-7"
          >
            <div className="mb-4 text-xs text-muted-foreground">The old stack</div>
            <h3 className="text-lg font-medium text-foreground">
              It&apos;s slow. It&apos;s bolted together.
            </h3>
            <ul className="mt-5 space-y-3">
              {oldStack.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground/80"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Center arrow — only renders on lg */}
          <div className="relative hidden items-center justify-center lg:flex">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          {/* Vortyx */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-7"
          >
            <div className="mb-4 text-xs text-accent">The Vortyx way</div>
            <h3 className="text-lg font-medium text-foreground">
              One platform. Real-time. Trusted.
            </h3>
            <ul className="mt-5 space-y-3">
              {newStack.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
