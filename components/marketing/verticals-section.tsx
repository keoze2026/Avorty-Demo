"use client";

/**
 * Verticals section — sits between Stats and Features.
 * Shows the industries Vortyx is purpose-built for, with believable per-vertical
 * stats and accent tones. Adds another layer of credibility to the landing page.
 */

import { motion } from "framer-motion";
import {
  Building2,
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
  tone: { ring: string; icon: string; glow: string };
}

const VERTICALS: Vertical[] = [
  {
    icon: HeartPulse,
    name: "Health Insurance",
    blurb: "Medicare AEP, ACA, supplemental — high-intent, qualified intake.",
    metric: "$42",
    metricLabel: "avg payout / qualified call",
    tone: {
      ring: "ring-[oklch(0.6_0.18_155)]/30",
      icon: "bg-[oklch(0.6_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
      glow: "rgba(40, 175, 110, 0.18)",
    },
  },
  {
    icon: Sun,
    name: "Solar & Home Services",
    blurb: "Roof-owner verification, dayparting, and geo-routing built in.",
    metric: "+11%",
    metricLabel: "conversion vs legacy stacks",
    tone: {
      ring: "ring-[oklch(0.6_0.16_75)]/30",
      icon: "bg-[oklch(0.6_0.16_75)]/10 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
      glow: "rgba(220, 160, 60, 0.18)",
    },
  },
  {
    icon: Gavel,
    name: "Legal",
    blurb: "Mass tort intake with consent capture and per-firm caps.",
    metric: "$120",
    metricLabel: "avg payout / qualified call",
    tone: {
      ring: "ring-[oklch(0.6_0.2_290)]/30",
      icon: "bg-[oklch(0.6_0.2_290)]/10 text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
      glow: "rgba(150, 95, 220, 0.18)",
    },
  },
  {
    icon: Car,
    name: "Auto Warranty",
    blurb: "Off-warranty vehicle owners, geo + tag filters, capacity-aware.",
    metric: "<150ms",
    metricLabel: "buyer match decision",
    tone: {
      ring: "ring-accent/30",
      icon: "bg-accent/10 text-accent",
      glow: "rgba(59, 182, 255, 0.18)",
    },
  },
  {
    icon: Home,
    name: "Mortgage & Refi",
    blurb: "Soft-pull pre-quals, debt-thresholds, FICO-aware routing.",
    metric: "23",
    metricLabel: "pre-built filters",
    tone: {
      ring: "ring-[oklch(0.6_0.2_10)]/30",
      icon: "bg-[oklch(0.6_0.2_10)]/10 text-[oklch(0.55_0.2_10)] dark:text-[oklch(0.72_0.2_10)]",
      glow: "rgba(225, 90, 130, 0.18)",
    },
  },
  {
    icon: Landmark,
    name: "Finance",
    blurb: "Debt consolidation, personal loans, tax relief — soft-pull qualifying.",
    metric: "44%",
    metricLabel: "avg conversion rate",
    tone: {
      ring: "ring-[oklch(0.6_0.18_155)]/30",
      icon: "bg-[oklch(0.6_0.18_155)]/10 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
      glow: "rgba(40, 175, 110, 0.18)",
    },
  },
];

export function VerticalsSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-24">
      {/* Ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, var(--vortyx-glow), transparent 40%), radial-gradient(circle at 80% 100%, var(--vortyx-glow), transparent 40%)",
          opacity: 0.4,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent">
            <Building2 className="h-4 w-4" />
            <span className="font-mono uppercase tracking-wider">Verticals</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Built for the calls that pay
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every vertical Vortyx supports ships with the filters, tags, and consent capture that vertical
            actually needs — so you're not gluing yours together from scratch.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
                className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 transition-all hover:-translate-y-1 hover:bg-card hover:ring-2 ${v.tone.ring}`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: v.tone.glow }}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${v.tone.icon}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold tabular-nums">{v.metric}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {v.metricLabel}
                    </div>
                  </div>
                </div>

                <h3 className="relative mt-5 font-mono text-lg font-semibold">{v.name}</h3>
                <p className="relative mt-1 text-sm text-muted-foreground">{v.blurb}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
