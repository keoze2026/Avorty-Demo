"use client";

/**
 * Live pulse panel — the hero card's right-rail partner. Vertical stack
 * carrying the most "right-now" numbers: live calls (with breathing
 * pulse animation), in-progress, ringing, queued — capped with a
 * subtle status line. Visually distinct from the hero so the two read
 * as complementary rather than competing.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, PhoneIncoming, Radio, Timer } from "lucide-react";

import { useCountUp } from "@/hooks/use-count-up";
import { formatNumber } from "@/lib/format";
import type { Call } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LivePulsePanelProps {
  liveCalls: number;
  calls: Call[];
}

export function LivePulsePanel({ liveCalls, calls }: LivePulsePanelProps) {
  const stats = useMemo(() => {
    const inProgress = calls.filter((c) => c.status === "in-progress").length;
    const ringing = calls.filter((c) => c.status === "ringing").length;
    // "Queued" is a fictional small number for the demo's pulse — we just
    // derive a plausible number from current in-progress count.
    const queued = Math.max(0, Math.round(inProgress * 0.18));
    return { inProgress, ringing, queued };
  }, [calls]);

  const animatedLive = useCountUp(liveCalls);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--success)]/30 bg-card"
      style={{
        background:
          "radial-gradient(ellipse 80% 80% at 50% 0%, color-mix(in oklab, var(--success) 16%, transparent), transparent 50%), var(--card)",
      }}
    >
      {/* Top: live headline */}
      <div className="relative flex flex-col items-start gap-1 border-b border-border/40 p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--success)]/40 bg-[color:var(--success)]/12 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-[color:var(--success)]">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
          </span>
          Live now
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tabular-nums tracking-tight text-[color:var(--success)]">
            {formatNumber(Math.round(animatedLive))}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            calls
          </span>
        </div>
      </div>

      {/* Middle: breakdown rows */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <PulseRow
          icon={Radio}
          label="In progress"
          value={stats.inProgress}
          tone="success"
          animated
        />
        <PulseRow
          icon={PhoneIncoming}
          label="Ringing"
          value={stats.ringing}
          tone="accent"
        />
        <PulseRow
          icon={Timer}
          label="Queued"
          value={stats.queued}
          tone="warning"
        />
      </div>

      {/* Bottom: live ticker badge */}
      <div className="border-t border-border/40 bg-secondary/20 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
          <Activity className="h-3 w-3 text-accent" />
          Streaming · auto-refresh
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

type Tone = "success" | "accent" | "warning";

interface PulseRowProps {
  icon: typeof Radio;
  label: string;
  value: number;
  tone: Tone;
  animated?: boolean;
}

const TONE_STYLES: Record<Tone, { text: string; bg: string }> = {
  success: { text: "text-[color:var(--success)]", bg: "bg-[color:var(--success)]/12" },
  accent: { text: "text-accent", bg: "bg-accent/12" },
  warning: { text: "text-[color:var(--warning)]", bg: "bg-[color:var(--warning)]/12" },
};

function PulseRow({ icon: Icon, label, value, tone, animated = false }: PulseRowProps) {
  const tones = TONE_STYLES[tone];
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-2">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "relative inline-flex h-7 w-7 items-center justify-center rounded-md",
            tones.bg,
            tones.text,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {animated && value > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-1.5 w-1.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70",
                  tones.text.replace("text-", "bg-"),
                )}
              />
              <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", tones.text.replace("text-", "bg-"))} />
            </span>
          )}
        </span>
        <span className="text-[12px] font-medium text-foreground">{label}</span>
      </div>
      <span className={cn("font-mono text-base font-semibold tabular-nums", tones.text)}>
        {formatNumber(value)}
      </span>
    </div>
  );
}
