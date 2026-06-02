"use client";

/**
 * The headline plan card. Premium gradient surface with embedded usage ring
 * for "calls included", and "manage / upgrade / cancel" actions.
 */

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MOCK_PLAN, MOCK_USAGE } from "@/lib/mock/billing";
import { formatCompact, formatCurrency } from "@/lib/format";
import { useTranslation } from "@/hooks/use-translation";

export function SubscriptionHero() {
  const { t } = useTranslation();
  const callsMetric = MOCK_USAGE.find((m) => m.key === "calls")!;
  const pct = Math.min(1, callsMetric.used / callsMetric.included);
  const renews = new Date(MOCK_PLAN.renewsAt);
  const overage = Math.max(0, callsMetric.used - callsMetric.included) * MOCK_PLAN.overageRatePerCall;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-accent/30 p-6 sm:p-8"
      style={{
        background:
          "radial-gradient(ellipse 80% 100% at 80% 0%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 60%), linear-gradient(135deg, var(--card) 0%, color-mix(in oklab, var(--accent) 8%, var(--card)) 100%)",
      }}
    >
      {/* Subtle dotted grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 bg-dot-grid"
        style={{
          maskImage: "radial-gradient(ellipse 60% 70% at 30% 0%, #000 30%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-stretch">
        {/* Left: plan + price + renewal */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-accent">
              <Sparkles className="h-2.5 w-2.5" />
              {t("toolsUI.billing.subscription.currentPlan")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {t("toolsUI.billing.subscription.renews").replace("{date}", renews.toLocaleDateString())}
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {MOCK_PLAN.tier}
          </h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-xl font-semibold">{formatCurrency(MOCK_PLAN.monthlyCost)}</span>
            <span className="text-[13px] text-muted-foreground">{t("toolsUI.billing.subscription.perMonth")}</span>
          </div>

          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            {t("toolsUI.billing.subscription.callsBefore").replace("{calls}", formatCompact(MOCK_PLAN.callsIncluded))}
            <span className="font-mono text-foreground">
              {formatCurrency(MOCK_PLAN.overageRatePerCall, true)}{t("toolsUI.billing.subscription.callsAfter")}
            </span>
            .{overage > 0 && (
              <>{t("toolsUI.billing.subscription.projectedOverage").replace("{amount}", formatCurrency(overage))}</>
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {t("toolsUI.billing.subscription.upgrade")}
            </Button>
            <Button size="sm" variant="outline">
              {t("toolsUI.billing.subscription.managePlan")}
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground">
              {t("toolsUI.billing.subscription.cancel")}
            </Button>
          </div>
        </div>

        {/* Right: usage ring */}
        <div className="flex items-center justify-center lg:w-72">
          <UsageRing
            pct={pct}
            used={callsMetric.used}
            included={callsMetric.included}
          />
        </div>
      </div>
    </motion.section>
  );
}

/**
 * SVG donut showing calls-included consumption. Uses CSS vars so it
 * matches the brand accent + theme automatically.
 */
function UsageRing({ pct, used, included }: { pct: number; used: number; included: number }) {
  const { t } = useTranslation();
  const size = 200;
  const radius = 80;
  const stroke = 14;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5266E0" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tabular-nums">{Math.round(pct * 100)}%</span>
        <span className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {t("toolsUI.billing.subscription.callsUsed")}
        </span>
        <span className="mt-1 font-mono text-[11px] text-foreground">
          {formatCompact(used)} / {formatCompact(included)}
        </span>
      </div>
    </div>
  );
}
