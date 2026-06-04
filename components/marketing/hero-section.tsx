"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Play, Shield, Star } from "lucide-react";

import { HeroPortalPulse } from "@/components/marketing/hero-portal-pulse";
import { HeroStage } from "@/components/marketing/hero-stage";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";

/**
 * Marketing hero — anchored constellation layout.
 *
 * Headline + CTAs at the top (unchanged from the previous design). Below it
 * a clean browser-chrome frame holds the dashboard mockup, with four small
 * product slices (news, live call, crypto, AI insight) floating around its
 * edges to communicate Avortyx's multi-product nature at a glance. The
 * orbit cards reuse the same glass formula as the AuthCard on /login so
 * the marketing site and the authenticated app feel like one universe.
 */
export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden pb-32">
      {/* Subtle ambient glow centred behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-32 -translate-x-1/2"
        style={{
          width: "1200px",
          height: "800px",
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col pt-28">
        {/* ─── Top row: copy block + Portal Pulse column ─────────── */}
        <div className="mx-auto mt-8 w-full max-w-6xl px-6">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
            {/* Copy block — unchanged, just no longer centered. */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="text-foreground/85">{t("marketingUI.hero.trustChipCount")}</span>
                <span className="text-muted-foreground/60">·</span>
                <span>{t("marketingUI.hero.trustChipSuffix")}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-medium leading-[1.1] text-balance text-foreground md:text-4xl lg:text-5xl"
              >
                {t("marketingUI.hero.headlinePart1")}
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(120deg, #3A4BC4 0%, #5266E0 50%, #818CF8 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  {t("marketingUI.hero.headlineGradient")}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 max-w-xl text-lg text-muted-foreground"
              >
                {t("marketingUI.hero.subhead")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 flex items-center gap-3"
              >
                <Link
                  href={ROUTES.signup}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {t("marketingUI.hero.ctaPrimary")}
                  <span aria-hidden="true">→</span>
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-secondary/50 hover:text-foreground"
                >
                  <Play className="h-4 w-4" />
                  {t("marketingUI.hero.ctaSecondary")}
                </button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[color:var(--success)]" />
                  <span>SOC 2 TYPE II</span>
                </div>
                <span className="text-muted-foreground/60">·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>TCPA READY</span>
                </div>
                <span className="text-muted-foreground/60">·</span>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-accent" />
                  <span>HIPAA TIER</span>
                </div>
                <span className="text-muted-foreground/60">·</span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-[color:var(--warning)]" />
                  <span>4.9 / 5 ON G2</span>
                </div>
              </motion.div>
            </div>

            {/* Portal Pulse column — hidden on mobile / shows beneath the
                copy on tablet, sits beside the copy on lg+. */}
            <div className="hidden lg:block">
              <HeroPortalPulse />
            </div>
          </div>
        </div>

        {/* ─── Abstract animated stage ──────────────────────────── */}
        <div className="relative mx-auto mt-16 w-full max-w-6xl px-6">
          <HeroStage />
        </div>
      </div>
    </section>
  );
}
