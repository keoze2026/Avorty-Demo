"use client";

/**
 * Hero Portal Pulse — vertical column that sits to the right of the hero
 * copy. Three live zones stacked in a single thin-bordered glass card:
 *
 *   1. 24h activity waveform — 28 mini bars representing call volume,
 *      slowly rolling left so it always reads as "happening right now".
 *   2. Recent activity feed — six events (calls, AI, markets, news)
 *      cycle through, slipping up by one row every ~2s.
 *   3. Portal-wide stats — three big numbers (networks live, calls/day,
 *      revenue routed) with subtle count-up on mount.
 *
 * No interface chrome. Everything is abstract data + numbers + thin
 * accent-tinted borders, harmonizing with the AuthCard and HeroStage.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Newspaper,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function HeroPortalPulse() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-accent/12 bg-card/30 p-5 backdrop-blur-md",
        "shadow-[0_24px_64px_-32px_rgba(8,10,32,0.45),0_0_40px_-22px_color-mix(in_oklch,var(--accent)_55%,transparent)]",
      )}
    >
      {/* Top accent sheen — subtle gradient to give the card depth. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-accent/[0.07] to-transparent"
      />

      <div className="relative space-y-5">
        <PulseHeader />
        <PulseWaveform />
        <ActivityFeed />
        <PortalStats />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Header                                                              */
/* ─────────────────────────────────────────────────────────────────── */

function PulseHeader() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent/15">
          <Activity className="h-3 w-3 text-accent" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
          {t("marketingUI.hero.pulse.title")}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--success)]">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
        </span>
        {t("marketingUI.hero.pulse.live")}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Waveform — 28-bar rolling call-volume sparkbar                      */
/* ─────────────────────────────────────────────────────────────────── */

const BAR_COUNT = 28;

function PulseWaveform() {
  const { t } = useTranslation();
  // Deterministic-looking seed so the bars don't flicker between renders
  // before the first animation tick.
  const seed = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < BAR_COUNT; i += 1) {
      // Smooth-ish wave biased toward the centre so the silhouette reads
      // as "today's curve".
      const phase = (i / BAR_COUNT) * Math.PI;
      const base = Math.sin(phase) * 0.55 + 0.35;
      const wiggle = Math.sin(i * 1.7) * 0.15;
      out.push(Math.max(0.15, Math.min(1, base + wiggle)));
    }
    return out;
  }, []);

  const [bars, setBars] = useState<number[]>(seed);

  // Roll the wave left every ~280ms — drop the leftmost bar, push a fresh
  // one on the right. Gives the silhouette continuous motion.
  useEffect(() => {
    const id = setInterval(() => {
      setBars((prev) => {
        const next = prev.slice(1);
        const last = prev[prev.length - 1];
        const drift = (Math.random() - 0.45) * 0.2;
        next.push(Math.max(0.18, Math.min(1, last + drift)));
        return next;
      });
    }, 280);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-border/30 bg-background/20 p-3">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{t("marketingUI.hero.pulse.waveformLabel")}</span>
        <span className="tabular-nums">{t("marketingUI.hero.pulse.waveformWindow")}</span>
      </div>
      <svg viewBox={`0 0 ${BAR_COUNT * 6} 48`} className="block h-12 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hero-pulse-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {bars.map((h, i) => {
          const x = i * 6;
          const barH = 6 + h * 38;
          const y = 48 - barH;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={3.5}
              height={barH}
              fill="url(#hero-pulse-bar)"
              rx={1.2}
              style={{
                transition: "height 260ms ease, y 260ms ease",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Activity feed — events scroll up                                    */
/* ─────────────────────────────────────────────────────────────────── */

interface ActivityEvent {
  kind: "call" | "ai" | "market" | "news";
  textKey: string;
  amountKey?: string;
}

const EVENT_POOL: ActivityEvent[] = [
  { kind: "call",   textKey: "marketingUI.hero.pulse.events.callApex",       amountKey: "marketingUI.hero.pulse.events.amountCallApex" },
  { kind: "ai",     textKey: "marketingUI.hero.pulse.events.aiSolarCap",     amountKey: "marketingUI.hero.pulse.events.aiConfidence" },
  { kind: "market", textKey: "marketingUI.hero.pulse.events.marketBtc",      amountKey: "marketingUI.hero.pulse.events.marketBtcDelta" },
  { kind: "news",   textKey: "marketingUI.hero.pulse.events.newsBriefings",  amountKey: "marketingUI.hero.pulse.events.newsCount" },
  { kind: "call",   textKey: "marketingUI.hero.pulse.events.callMassTort",   amountKey: "marketingUI.hero.pulse.events.amountCallMassTort" },
  { kind: "market", textKey: "marketingUI.hero.pulse.events.marketEth",      amountKey: "marketingUI.hero.pulse.events.marketEthDelta" },
  { kind: "ai",     textKey: "marketingUI.hero.pulse.events.aiAcceptance",   amountKey: "marketingUI.hero.pulse.events.aiAcceptanceDelta" },
  { kind: "news",   textKey: "marketingUI.hero.pulse.events.newsTechCrunch", amountKey: "marketingUI.hero.pulse.events.newsTime" },
];

const KIND_META: Record<
  ActivityEvent["kind"],
  { Icon: React.ElementType; toneClass: string }
> = {
  call:   { Icon: Phone,      toneClass: "text-accent" },
  ai:     { Icon: Sparkles,   toneClass: "text-accent" },
  market: { Icon: TrendingUp, toneClass: "text-[color:var(--success)]" },
  news:   { Icon: Newspaper,  toneClass: "text-muted-foreground" },
};

const VISIBLE_ROWS = 4;

function ActivityFeed() {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);

  // Every ~2.2s, advance the offset by 1 so the feed scrolls up one row.
  useEffect(() => {
    const id = setInterval(() => {
      setOffset((p) => (p + 1) % EVENT_POOL.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Build a list of (VISIBLE_ROWS + 1) items starting at offset so we
  // always have a "head" event animating in from the top.
  const visible = useMemo(() => {
    return Array.from({ length: VISIBLE_ROWS + 1 }, (_, i) => {
      const idx = (offset + i) % EVENT_POOL.length;
      return { ...EVENT_POOL[idx], key: `${offset}-${i}` };
    });
  }, [offset]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("marketingUI.hero.pulse.activityLabel")}
        </span>
        <span className="text-[10px] text-muted-foreground/70">
          {t("marketingUI.hero.pulse.activityHint")}
        </span>
      </div>
      <div
        ref={feedRef}
        className="relative h-[7rem] overflow-hidden"
        // Soft gradient mask so events fade in at the top and out at the
        // bottom — reinforces the "scrolling feed" feel.
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        <ul className="flex flex-col">
          {visible.map((ev, i) => {
            const meta = KIND_META[ev.kind];
            const Icon = meta.Icon;
            const isHead = i === 0;
            return (
              <motion.li
                key={ev.key}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isHead ? 1 : 0.65 - i * 0.1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex h-7 items-center gap-2 text-xs"
              >
                <Icon className={cn("h-3 w-3 shrink-0", meta.toneClass)} />
                <span className="min-w-0 flex-1 truncate text-foreground/85">
                  {t(ev.textKey)}
                </span>
                {ev.amountKey && (
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {t(ev.amountKey)}
                  </span>
                )}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Portal stats — three big numbers with count-up                     */
/* ─────────────────────────────────────────────────────────────────── */

interface PortalStat {
  labelKey: string;
  /** Target — a number triggers count-up animation; string renders as-is. */
  target: number | string;
  /** Optional suffix appended to the animated count (e.g. "+", "K"). */
  suffix?: string;
}

const STATS: PortalStat[] = [
  { labelKey: "marketingUI.hero.pulse.stats.networks", target: 500, suffix: "+" },
  { labelKey: "marketingUI.hero.pulse.stats.calls",    target: "2.4M" },
  { labelKey: "marketingUI.hero.pulse.stats.revenue",  target: "$24K" },
];

function PortalStats() {
  return (
    <div className="grid grid-cols-3 gap-2 border-t border-border/30 pt-4">
      {STATS.map((s) => (
        <StatTile key={s.labelKey} stat={s} />
      ))}
    </div>
  );
}

function StatTile({ stat }: { stat: PortalStat }) {
  const { t } = useTranslation();
  const [display, setDisplay] = useState<string>(
    typeof stat.target === "number" ? "0" : stat.target,
  );

  useEffect(() => {
    if (typeof stat.target !== "number") return;
    const start = performance.now();
    const duration = 1600;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(stat.target as number * eased).toLocaleString());
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [stat.target]);

  return (
    <div className="flex flex-col">
      <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
        {display}
        {stat.suffix}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {t(stat.labelKey)}
      </span>
    </div>
  );
}

