"use client";

/**
 * The top-of-page "co-pilot briefing".
 * Personalized greeting + 3 headline insights, anchored by an animated
 * Avortyx-logo halo that signals "AI is actively analyzing right now".
 */

import { motion } from "framer-motion";
import { Activity, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTranslation } from "@/hooks/use-translation";

interface HighlightStat {
  labelKey: string;
  value: string;
  deltaKey?: string;
  tone: "positive" | "warning" | "neutral";
  icon: typeof TrendingUp;
}

const HIGHLIGHTS: HighlightStat[] = [
  {
    labelKey: "toolsUI.insights.hero.recommendations",
    value: "6 open",
    deltaKey: "toolsUI.insights.hero.recommendationsDelta",
    tone: "positive",
    icon: Sparkles,
  },
  {
    labelKey: "toolsUI.insights.hero.anomalies",
    value: "8",
    deltaKey: "toolsUI.insights.hero.anomaliesDelta",
    tone: "warning",
    icon: AlertTriangle,
  },
  {
    labelKey: "toolsUI.insights.hero.netImpact",
    value: "+$1,840",
    deltaKey: "toolsUI.insights.hero.netImpactDelta",
    tone: "positive",
    icon: TrendingUp,
  },
];

const TONE_CLASSES: Record<HighlightStat["tone"], { icon: string; chip: string }> = {
  positive: {
    icon: "bg-[color:var(--success)]/12 text-[color:var(--success)]",
    chip: "text-[color:var(--success)]",
  },
  warning: {
    icon: "bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
    chip: "text-[color:var(--warning)]",
  },
  neutral: {
    icon: "bg-accent/10 text-accent",
    chip: "text-accent",
  },
};

function greetingKey() {
  const h = new Date().getHours();
  if (h < 5) return "toolsUI.insights.hero.greetingLate";
  if (h < 12) return "toolsUI.insights.hero.greetingMorning";
  if (h < 17) return "toolsUI.insights.hero.greetingAfternoon";
  if (h < 21) return "toolsUI.insights.hero.greetingEvening";
  return "toolsUI.insights.hero.greetingNight";
}

export function AiBriefingHero() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.name ?? "there").split(" ")[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8"
      style={{
        background:
          "linear-gradient(135deg, var(--card) 0%, color-mix(in oklab, var(--accent) 10%, var(--card)) 100%)",
      }}
    >
      {/* Soft halo behind the logo — single subtle accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%)",
        }}
      />

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        {/* Animated logo halo */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20">
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 40%, transparent), transparent 70%)",
              }}
            />
            <div className="relative flex h-full w-full items-center justify-center">
              <Logo animated className="h-12 w-12 sm:h-14 sm:w-14" uid="briefing" />
            </div>
          </div>
        </div>

        {/* Greeting copy */}
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[11px] font-medium text-accent">
            <Activity className="h-3 w-3" />
            {t("toolsUI.insights.hero.copilotBadge")}
          </span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t(greetingKey())}, {firstName}.
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] text-muted-foreground">
            {t("toolsUI.insights.hero.introBody")}
          </p>
        </div>

        {/* Highlight stats */}
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {HIGHLIGHTS.map((h, i) => {
            const Icon = h.icon;
            const tone = TONE_CLASSES[h.tone];
            const value =
              h.labelKey === "toolsUI.insights.hero.recommendations"
                ? t("toolsUI.insights.hero.recommendationsValue")
                : h.value;
            return (
              <motion.div
                key={h.labelKey}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2 backdrop-blur-md sm:min-w-[180px]"
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${tone.icon}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tabular-nums">{value}</div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-muted-foreground">{t(h.labelKey)}</span>
                    {h.deltaKey && <span className={tone.chip}>· {t(h.deltaKey)}</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
