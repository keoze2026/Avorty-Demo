"use client";

/**
 * Verticals section — industries Vortyx is purpose-built for.
 * Single muted treatment per card, no per-vertical color rainbow.
 */

import { motion } from "framer-motion";
import {
  Car,
  Gavel,
  HeartPulse,
  Home,
  Landmark,
  Sun,
  type LucideIcon,
} from "lucide-react";

interface Vertical {
  icon: LucideIcon;
  name: string;
  blurb: string;
  metric: string;
  metricLabel: string;
}

const VERTICALS: Vertical[] = [
  {
    icon: HeartPulse,
    name: "Health Insurance",
    blurb: "Medicare AEP, ACA, supplemental — high-intent, qualified intake.",
    metric: "$42",
    metricLabel: "avg payout / call",
  },
  {
    icon: Sun,
    name: "Solar & Home Services",
    blurb: "Roof-owner verification, dayparting, and geo-routing built in.",
    metric: "+11%",
    metricLabel: "vs legacy stacks",
  },
  {
    icon: Gavel,
    name: "Legal",
    blurb: "Mass tort intake with consent capture and per-firm caps.",
    metric: "$120",
    metricLabel: "avg payout / call",
  },
  {
    icon: Car,
    name: "Auto Warranty",
    blurb: "Off-warranty vehicle owners, geo + tag filters, capacity-aware.",
    metric: "<150ms",
    metricLabel: "buyer match",
  },
  {
    icon: Home,
    name: "Mortgage & Refi",
    blurb: "Soft-pull pre-quals, debt-thresholds, FICO-aware routing.",
    metric: "23",
    metricLabel: "pre-built filters",
  },
  {
    icon: Landmark,
    name: "Finance",
    blurb: "Debt consolidation, personal loans, tax relief — soft-pull qualifying.",
    metric: "44%",
    metricLabel: "avg conversion",
  },
];

export function VerticalsSection() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Built for the calls that pay
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Every vertical ships with the filters, tags, and consent capture it actually
            needs — so you&apos;re not gluing yours together from scratch.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: "easeOut" }}
                className="rounded-2xl border border-border/60 bg-card/40 p-6 transition-colors hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary/60 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="text-right">
                    <div className="text-base font-medium tabular-nums text-foreground">
                      {v.metric}
                    </div>
                    <div className="text-xs text-muted-foreground">{v.metricLabel}</div>
                  </div>
                </div>

                <h3 className="mt-5 text-base font-medium text-foreground">{v.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.blurb}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
