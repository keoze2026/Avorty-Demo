"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { TIERS, type KycTierDefinition } from "@/lib/store/kyc-store";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const TIER_LABEL_KEYS: Record<string, string> = {
  sandbox: "toolsUI.trustEngine.tiers.sandbox",
  bronze: "toolsUI.trustEngine.tiers.bronze",
  silver: "toolsUI.trustEngine.tiers.silver",
  gold: "toolsUI.trustEngine.tiers.gold",
  platinum: "toolsUI.trustEngine.tiers.platinum",
};

interface Props {
  /** 0–100 trust score. */
  score: number;
  tier: KycTierDefinition;
  /** Optional — the next tier above, used to draw the goal marker. */
  next: KycTierDefinition | null;
}

/**
 * Radial trust-score gauge — 270° arc with five tier "tick marks" around the
 * rim so the user always sees where they are vs the next unlock. The score
 * value animates from 0 on mount so the gauge feels alive.
 */
export function TrustScoreGauge({ score, tier, next }: Props) {
  const { t } = useTranslation();
  // Animate from 0 to score on mount.
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    const start = Date.now();
    const duration = 900;
    const from = shown;
    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (score - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // We intentionally only re-run on score change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // Arc geometry — 270° sweep starting at 135° (bottom-left) clockwise.
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 90;
  const STROKE = 12;
  const SWEEP_DEG = 270;
  const START_DEG = 135;

  // Length of one degree of arc in SVG path units.
  const fullArc = (SWEEP_DEG / 360) * 2 * Math.PI * R;
  const filledArc = (shown / 100) * fullArc;

  // Convert polar (deg) → cartesian for SVG.
  const polar = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  };
  const start = polar(START_DEG);
  const endDeg = START_DEG + SWEEP_DEG;
  const end = polar(endDeg);
  // Large-arc flag — true when sweep > 180°.
  const largeArc = SWEEP_DEG > 180 ? 1 : 0;

  const arcPath = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label={t("toolsUI.trustEngine.gauge.outOf").replace("{score}", String(score))}
      >
        <defs>
          <linearGradient id="trust-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.18 265)" />
            <stop offset="50%" stopColor="oklch(0.7 0.18 265)" />
            <stop offset="100%" stopColor="oklch(0.85 0.18 265)" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={arcPath}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          opacity={0.45}
        />

        {/* Filled portion */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke="url(#trust-grad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${filledArc} ${fullArc}`}
          initial={{ strokeDasharray: `0 ${fullArc}` }}
          animate={{ strokeDasharray: `${filledArc} ${fullArc}` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Tier tick marks */}
        {TIERS.map((tierDef) => {
          const pct = tierDef.minScore / 100;
          const tickDeg = START_DEG + pct * SWEEP_DEG;
          const inner = polarOnRadius(tickDeg, R - STROKE / 2 - 2, CX, CY);
          const outer = polarOnRadius(tickDeg, R + STROKE / 2 + 2, CX, CY);
          const reached = score >= tierDef.minScore;
          return (
            <line
              key={tierDef.id}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={reached ? "oklch(0.78 0.18 265)" : "var(--muted-foreground)"}
              strokeOpacity={reached ? 0.9 : 0.35}
              strokeWidth={1.5}
            />
          );
        })}
      </svg>

      {/* Centered readout */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("toolsUI.trustEngine.gauge.title")}
        </span>
        <span className="mt-1 font-mono text-5xl font-semibold tabular-nums text-foreground">
          {shown}
        </span>
        <span
          className={cn(
            "mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
            tier.badgeClass,
          )}
        >
          {t(TIER_LABEL_KEYS[tier.id] ?? "")}
        </span>
        {next && (
          <span className="mt-1 text-[10px] text-muted-foreground">
            {t("toolsUI.trustEngine.gauge.ptsToNext")
              .replace("{points}", String(next.minScore - score))
              .replace("{tier}", t(TIER_LABEL_KEYS[next.id] ?? ""))}
          </span>
        )}
      </div>
    </div>
  );
}

function polarOnRadius(
  deg: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}
