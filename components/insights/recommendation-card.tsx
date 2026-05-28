"use client";

/**
 * Rich recommendation card — the headline interaction surface of the page.
 *
 * - Tone-coded by kind (scale / pause / rebalance / alert / optimize)
 * - Confidence ring renders model confidence as a donut
 * - Before/after micro-spark previews the projected impact
 * - Apply / Snooze / Dismiss actions with optimistic toast
 * - Expandable rationale that explains *why*
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  PauseCircle,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
  X,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AiRecommendation,
  type RecommendationKind,
  type RecommendationStatus,
} from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  RecommendationKind,
  { icon: LucideIcon; label: string; tone: { text: string; bg: string; ring: string; border: string; line: string } }
> = {
  scale: {
    icon: TrendingUp,
    label: "Scale up",
    tone: {
      text: "text-[color:var(--success)]",
      bg: "bg-[color:var(--success)]/12",
      ring: "ring-[color:var(--success)]/30",
      border: "border-[color:var(--success)]/30",
      line: "var(--success)",
    },
  },
  pause: {
    icon: PauseCircle,
    label: "Pause",
    tone: {
      text: "text-[color:var(--warning)]",
      bg: "bg-[color:var(--warning)]/12",
      ring: "ring-[color:var(--warning)]/30",
      border: "border-[color:var(--warning)]/30",
      line: "var(--warning)",
    },
  },
  rebalance: {
    icon: Scale,
    label: "Rebalance",
    tone: {
      text: "text-[color:var(--chart-3)]",
      bg: "bg-[color:var(--chart-3)]/12",
      ring: "ring-[color:var(--chart-3)]/30",
      border: "border-[color:var(--chart-3)]/30",
      line: "var(--chart-3)",
    },
  },
  alert: {
    icon: AlertTriangle,
    label: "Alert",
    tone: {
      text: "text-destructive",
      bg: "bg-destructive/12",
      ring: "ring-destructive/30",
      border: "border-destructive/30",
      line: "var(--destructive)",
    },
  },
  optimize: {
    icon: Sparkles,
    label: "Optimize",
    tone: {
      text: "text-accent",
      bg: "bg-accent/12",
      ring: "ring-accent/30",
      border: "border-accent/30",
      line: "var(--accent)",
    },
  },
};

interface Props {
  recommendation: AiRecommendation;
  onAction: (id: string, status: RecommendationStatus) => void;
}

export function RecommendationCard({ recommendation: r, onAction }: Props) {
  const meta = KIND_META[r.kind];
  const Icon = meta.icon;
  const [expanded, setExpanded] = useState(false);

  // Build the chart series with a "where baseline ends, projected starts" gap
  const data = [
    ...r.baseline.map((v, i) => ({ i, baseline: v, projected: null as number | null })),
    ...r.projected.map((v, i) => ({ i: r.baseline.length + i, baseline: null as number | null, projected: v })),
  ];

  const apply = () => {
    onAction(r.id, "applied");
    toast.success("Applied", { description: r.title });
  };
  const snooze = () => {
    onAction(r.id, "snoozed");
    toast.success("Snoozed for 24 hours");
  };
  const dismiss = () => {
    onAction(r.id, "dismissed");
    toast.success("Dismissed");
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Ambient tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `color-mix(in oklab, ${meta.tone.line} 30%, transparent)` }}
      />

      <div className="relative p-5">
        {/* Header */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", meta.tone.bg, meta.tone.text)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", meta.tone.bg, meta.tone.text)}>
                  {meta.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {r.scope.type} · {r.scope.name}
                </span>
              </div>
              <h3 className="mt-2 text-base font-semibold leading-snug">{r.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{r.body}</p>
            </div>
          </div>

          {/* Confidence ring */}
          <ConfidenceRing value={r.confidence} tone={meta.tone.line} />
        </header>

        {/* Impact + chart */}
        <div className="mt-4 grid grid-cols-1 items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
          <ImpactStat
            label={r.impact.label}
            value={r.impact.value}
            direction={r.impact.direction}
            tone={meta.tone}
          />
          <BeforeAfter data={data} line={meta.tone.line} />
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
            {expanded ? "Hide rationale" : "Why this?"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(r.createdAt)}
            </span>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={dismiss}>
              <X className="h-3.5 w-3.5" /> Dismiss
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={snooze}>
              <Clock className="h-3.5 w-3.5" /> Snooze
            </Button>
            <Button size="sm" className="h-8 px-3 text-xs" onClick={apply}>
              <Check className="h-3.5 w-3.5" /> Apply
            </Button>
          </div>
        </div>

        {/* Expandable rationale */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3 text-xs text-foreground">
                {r.rationale}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/* ============ subcomponents ============ */

function ConfidenceRing({ value, tone }: { value: number; tone: string }) {
  const size = 56;
  const radius = 22;
  const stroke = 4;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - value);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-sm font-bold tabular-nums">{Math.round(value * 100)}</span>
        <span className="text-[9px] text-muted-foreground">conf</span>
      </div>
    </div>
  );
}

function ImpactStat({
  label,
  value,
  direction,
  tone,
}: {
  label: string;
  value: string;
  direction: "up" | "down";
  tone: { text: string };
}) {
  const Arrow = direction === "up" ? ArrowUp : ArrowDown;
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 flex items-baseline gap-1 text-2xl font-bold tabular-nums tracking-tight", tone.text)}>
        <Arrow className="h-4 w-4" strokeWidth={3} />
        {value}
      </div>
    </div>
  );
}

function BeforeAfter({
  data,
  line,
}: {
  data: Array<{ i: number; baseline: number | null; projected: number | null }>;
  line: string;
}) {
  const gradId = `proj-${line.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div className="h-16 w-full overflow-hidden rounded-lg border border-border/60 bg-secondary/20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.45} />
              <stop offset="100%" stopColor={line} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="baseline"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            fill="transparent"
            connectNulls={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="projected"
            stroke={line}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
