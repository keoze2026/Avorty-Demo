/**
 * LiveRadar — the Live Monitor hero.
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │  ● radar disc (concentric rings + sweep + ping)     │
 *   │     big in-flight count in the center               │
 *   │  │  session stats — started / completed / missed    │
 *   │  │  featured-call mini card                         │
 *   └─────────────────────────────────────────────────────┘
 */

"use client";

import { motion } from "framer-motion";
import { CheckCircle2, DollarSign, PhoneCall, PhoneMissed, Radar } from "lucide-react";

import { LiveCallCard } from "@/components/live/live-call-card";
import { useCountUp } from "@/hooks/use-count-up";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LiveRadarProps {
  inFlight: Call[];
  featured: Call | null;
  totals: { started: number; completed: number; missed: number; revenue: number };
}

export function LiveRadar({ inFlight, featured, totals }: LiveRadarProps) {
  const animated = useCountUp(inFlight.length, { duration: 350 });

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "var(--vortyx-glow)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-hex-dot opacity-40"
      />

      {/* Corner crosshairs */}
      <Crosshair className="left-3 top-3" />
      <Crosshair className="right-3 top-3" />
      <Crosshair className="left-3 bottom-3" />
      <Crosshair className="right-3 bottom-3" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12">
        {/* RADAR DISC */}
        <div className="relative flex h-[320px] items-center justify-center border-b border-border/60 p-6 lg:col-span-5 lg:h-auto lg:border-b-0 lg:border-r">
          {/* Concentric rings */}
          <div className="relative h-72 w-72">
            <div aria-hidden className="absolute inset-0 rounded-full bg-radar-rings" />

            {/* Rotating sweep */}
            <div
              aria-hidden
              className="absolute inset-0 animate-radar-sweep"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--accent) 38%, transparent) 18deg, transparent 60deg)",
                maskImage: "radial-gradient(circle at center, transparent 22%, black 22.5% 76%, transparent 76.5%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, transparent 22%, black 22.5% 76%, transparent 76.5%)",
                borderRadius: "9999px",
              }}
            />

            {/* Crosshair lines */}
            <div aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-accent/15" />
            <div aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-accent/15" />

            {/* Pulsing dots — one per in-flight call (max 6) */}
            {inFlight.slice(0, 6).map((c, i) => {
              const angle = (i / 6) * Math.PI * 2 + (parseInt(c.id.slice(-3), 36) % 7);
              const r = 80 + ((parseInt(c.id.slice(-2), 36) % 30));
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <span
                  key={c.id}
                  className="pointer-events-none absolute left-1/2 top-1/2 inline-flex"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute -left-2 -top-2 h-6 w-6 animate-radar-pulse rounded-full bg-accent/40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
                  </span>
                </span>
              );
            })}

            {/* Center display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                in-flight
              </span>
              <span className="mt-1 font-mono text-6xl font-bold tabular-nums leading-none">
                {Math.round(animated)}
              </span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                active calls
              </span>
            </div>
          </div>

          {/* Compass marks */}
          <CompassMark className="left-1/2 top-2 -translate-x-1/2" label="N" />
          <CompassMark className="right-2 top-1/2 -translate-y-1/2" label="E" />
          <CompassMark className="left-1/2 bottom-2 -translate-x-1/2" label="S" />
          <CompassMark className="left-2 top-1/2 -translate-y-1/2" label="W" />
        </div>

        {/* Right side — session stats + featured */}
        <div className="relative flex flex-col gap-4 p-6 lg:col-span-7">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
                <Radar className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Live Radar
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  All routes · all geos
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              session · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </header>

          {/* Session telemetry — 4 instrument tiles */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Telemetry icon={PhoneCall} label="Started" value={totals.started} tone="accent" />
            <Telemetry icon={CheckCircle2} label="Completed" value={totals.completed} tone="emerald" />
            <Telemetry icon={PhoneMissed} label="Missed" value={totals.missed} tone="amber" />
            <Telemetry icon={DollarSign} label="Revenue" value={totals.revenue} tone="accent" money />
          </div>

          {/* Featured call */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                ▣ FEATURED · longest active
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {featured ? featured.id.slice(-6).toUpperCase() : "—"}
              </span>
            </div>
            {featured ? (
              <LiveCallCard call={featured} isLive={inFlight.includes(featured)} />
            ) : (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/60 font-mono text-[11px] text-muted-foreground">
                Awaiting first call…
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-2.5 w-2.5",
        "before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-accent/55",
        "after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-translate-y-1/2 after:bg-accent/55",
        className,
      )}
    />
  );
}

function CompassMark({ className, label }: { className?: string; label: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute font-mono text-[9px] font-bold tracking-wider text-muted-foreground/60",
        className,
      )}
    >
      {label}
    </span>
  );
}

interface TelemetryProps {
  icon: typeof PhoneCall;
  label: string;
  value: number;
  tone: "accent" | "emerald" | "amber";
  money?: boolean;
}

function Telemetry({ icon: Icon, label, value, tone, money = false }: TelemetryProps) {
  const animated = useCountUp(value, { duration: 500 });
  const display = money
    ? formatCurrency(animated)
    : formatNumber(Math.round(animated));

  const tones: Record<TelemetryProps["tone"], string> = {
    accent: "text-accent border-accent/30",
    emerald: "text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)] border-[oklch(0.6_0.18_155)]/30",
    amber: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)] border-[oklch(0.6_0.16_75)]/30",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="relative overflow-hidden rounded-lg border border-border bg-card p-3"
    >
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-md border", tones[tone])}>
          <Icon className="h-3 w-3" />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 font-mono text-xl font-bold tabular-nums">{display}</div>
    </motion.div>
  );
}
