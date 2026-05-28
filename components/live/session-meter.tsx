/**
 * SessionMeter — current-session conversion bar + radial dial.
 * Replaces the legacy LiveStatsPanel for the redesigned page.
 */

"use client";

import { motion } from "framer-motion";

import { BracketCard } from "@/components/shared/bracket-card";
import { SectionLabel } from "@/components/shared/section-label";

interface SessionMeterProps {
  totals: { started: number; completed: number; missed: number; revenue: number };
  inFlightCount: number;
}

export function SessionMeter({ totals, inFlightCount }: SessionMeterProps) {
  const conversion =
    totals.started > 0 ? (totals.completed / totals.started) * 100 : 0;
  const reject = totals.started > 0 ? (totals.missed / totals.started) * 100 : 0;

  return (
    <BracketCard>
      <SectionLabel index={4} title="Session meter" meta="real time" />

      {/* Radial dial */}
      <div className="flex items-center gap-4">
        <Dial value={conversion} />
        <div className="min-w-0 flex-1 space-y-1">
          <RailRow label="Conversion" value={conversion} tone="accent" />
          <RailRow label="Reject" value={reject} tone="amber" />
          <RailRow
            label="Active"
            value={Math.min(100, inFlightCount * 8)}
            display={`${inFlightCount} now`}
            tone="emerald"
          />
        </div>
      </div>

      {/* Session totals */}
      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border/40 pt-3 text-center">
        <Cell label="Start" value={totals.started} />
        <Cell label="Done" value={totals.completed} />
        <Cell label="Miss" value={totals.missed} />
        <Cell label="$" value={`$${Math.round(totals.revenue).toLocaleString()}`} />
      </div>
    </BracketCard>
  );
}

function Dial({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const angle = (pct / 100) * 360;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--accent) ${angle}deg, color-mix(in oklab, var(--border) 80%, transparent) ${angle}deg)`,
        }}
      />
      <div className="absolute inset-1.5 rounded-full bg-card" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums tracking-tight">{pct.toFixed(0)}%</span>
        <span className="text-[10px] text-muted-foreground">conversion</span>
      </div>
    </div>
  );
}

function RailRow({
  label,
  value,
  display,
  tone,
}: {
  label: string;
  value: number;
  display?: string;
  tone: "accent" | "amber" | "emerald";
}) {
  const tones: Record<"accent" | "amber" | "emerald", string> = {
    accent: "bg-accent",
    amber: "bg-[color:var(--warning)]",
    emerald: "bg-[color:var(--success)]",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium text-foreground tabular-nums">{display ?? `${value.toFixed(1)}%`}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary/60">
        <motion.div
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.45 }}
          className={`h-full rounded-full ${tones[tone]}`}
        />
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 py-2">
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
