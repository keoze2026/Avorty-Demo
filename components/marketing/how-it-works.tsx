"use client";

/**
 * How it works — 4-step visual flow.
 * Numbered cards arranged horizontally. Quiet, no glow, no per-card hover lift.
 */

import { motion } from "framer-motion";
import { Building2, GitFork, Hash, Radio } from "lucide-react";
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
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Live in your network by lunch.
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Four steps from &quot;we just signed&quot; to &quot;calls are routing.&quot; No deployment,
            no implementation team.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
                  className="rounded-2xl border border-border/60 bg-card/40 p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary/60 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">{step.num}</span>
                  </div>
                  <h3 className="mt-4 text-base font-medium text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
