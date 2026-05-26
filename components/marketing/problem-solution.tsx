"use client";

/**
 * Problem → Solution section.
 * Side-by-side emotional comparison: the legacy stack vs Vortyx.
 * Short. Punchy. The bullets do the work.
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
    <section className="relative overflow-hidden py-24 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground backdrop-blur">
            The shift
          </span>
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Stop gluing five tools together.
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Legacy call tracking is a graveyard of admin UIs, CSV exports, and stale dashboards.
            Vortyx puts the whole network in one live pane.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* The old stack — muted, struck-through feel */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-7 backdrop-blur-md"
          >
            <div className="mb-4 flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <X className="h-3 w-3" />
              </span>
              The old stack
            </div>
            <h3 className="font-sans text-xl font-semibold">It's slow. It's bolted together.</h3>
            <ul className="mt-5 space-y-3">
              {oldStack.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground/80 line-through decoration-muted-foreground/40 decoration-1 underline-offset-4"
                >
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive/70" />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Center arrow — only renders on lg */}
          <div className="relative hidden items-center justify-center lg:flex">
            <div
              aria-hidden
              className="absolute inset-y-6 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent"
            />
            <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-card text-accent shadow-lg shadow-accent/10">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          {/* Vortyx — bright, alive */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-accent/40 bg-card p-7 shadow-xl shadow-accent/10 backdrop-blur-md"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl"
              style={{ background: "rgba(59, 182, 255, 0.22)" }}
            />
            <div className="relative mb-4 flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-accent">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15">
                <Check className="h-3 w-3" />
              </span>
              The Vortyx way
            </div>
            <h3 className="relative font-sans text-xl font-semibold">One platform. Real-time. Trusted.</h3>
            <ul className="relative mt-5 space-y-3">
              {newStack.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
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
