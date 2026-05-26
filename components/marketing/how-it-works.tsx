"use client";

/**
 * How it works — 4-step visual flow.
 * Numbered cards arranged horizontally on desktop with a connecting
 * gradient line. On mobile they stack as a vertical timeline.
 */

import { motion } from "framer-motion";
import { Building2, GitFork, Hash, Radio, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  num: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    icon: Hash,
    title: "Provision numbers",
    body: "Spin up local or toll-free DIDs in bulk. Organize them into pools with rotation rules.",
  },
  {
    num: "02",
    icon: GitFork,
    title: "Build your routing",
    body: "Drag-and-drop ring trees with filters, splits, caps, and fallbacks. No tickets, no waiting.",
  },
  {
    num: "03",
    icon: Building2,
    title: "Connect buyers",
    body: "Invite buyers and publishers. Set bids, caps, and concurrency from a single screen.",
  },
  {
    num: "04",
    icon: Radio,
    title: "Watch it run live",
    body: "Every call, every decision, every dollar — observable on a single real-time dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-24">
      {/* Background flourish */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[28rem]"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 50%, var(--vortyx-glow), transparent 70%)",
          opacity: 0.4,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground backdrop-blur">
            <Workflow className="h-3 w-3 text-accent" />
            How it works
          </span>
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Live in your network by lunch.
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Four steps from "we just signed" to "calls are routing." No deployment, no implementation team.
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl">
          {/* Desktop connector line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[2.75rem] hidden h-px lg:block"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--accent) 10%, var(--accent) 90%, transparent)",
              opacity: 0.4,
            }}
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                  className="group relative"
                >
                  {/* Numbered badge sits on the connector line */}
                  <div className="relative z-10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-lg transition-all group-hover:-translate-y-0.5 group-hover:border-accent/50 group-hover:shadow-accent/20">
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-mono font-bold text-accent-foreground shadow">
                      {step.num}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-all group-hover:border-accent/40 group-hover:bg-card group-hover:shadow-xl group-hover:shadow-accent/10">
                    <h3 className="text-balance font-sans text-lg font-semibold leading-snug">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
