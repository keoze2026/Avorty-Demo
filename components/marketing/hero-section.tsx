"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Play, Shield, Star } from "lucide-react";

import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";

/**
 * Hero — badge, headline, subhead, CTAs, trust badges, and a full-bleed
 * 3D-rotated dashboard preview behind. Uses project theme tokens — the
 * background comes from the marketing layout's bg-background.
 */
export function HeroSection() {
  const { t } = useTranslation();
  const [yOffset, setYOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const offset = Math.min(window.scrollY / 300, 1) * -20;
      setYOffset(offset);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseTransform = {
    translateX: 2,
    scale: 1.2,
    rotateX: 47,
    rotateY: 31,
    rotateZ: 324,
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Subtle glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -30%)",
          width: "1200px",
          height: "800px",
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 pt-28 flex flex-col">
        {/* Hero copy — contained and centered */}
        <div className="w-full flex justify-center px-6 mt-16">
          <div className="w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <span className="text-foreground/85">{t("marketingUI.hero.trustChipCount")}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{t("marketingUI.hero.trustChipSuffix")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-[1.1] text-balance"
            >
              {t("marketingUI.hero.headlinePart1")}
              <br />
              <span
                className="text-transparent bg-clip-text"
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
              className="mt-6 text-lg text-muted-foreground max-w-xl"
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
                className="px-5 py-2.5 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors text-sm inline-flex items-center gap-2"
              >
                {t("marketingUI.hero.ctaPrimary")}
                <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="text-foreground/85 font-medium hover:text-foreground transition-colors inline-flex items-center gap-2 text-sm border border-border px-4 py-2.5 rounded-lg hover:bg-secondary/50"
              >
                <Play className="w-4 h-4" />
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
                <Shield className="w-4 h-4 text-[color:var(--success)]" />
                <span>SOC 2 TYPE II</span>
              </div>
              <span className="text-muted-foreground/60">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>TCPA READY</span>
              </div>
              <span className="text-muted-foreground/60">·</span>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent" />
                <span>HIPAA TIER</span>
              </div>
              <span className="text-muted-foreground/60">·</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[color:var(--warning)]" />
                <span>4.9 / 5 ON G2</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3D Stage — full bleed */}
        <div
          className="relative mt-16"
          style={{
            width: "100vw",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            position: "relative",
            left: "50%",
            right: "50%",
            height: "700px",
            marginTop: "-60px",
          }}
        >
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-72 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, var(--background) 20%, transparent 100%)",
            }}
          />

          <div
            style={{
              transform: `translateY(${yOffset}px)`,
              transition: "transform 0.1s ease-out",
              contain: "strict",
              perspective: "4000px",
              perspectiveOrigin: "100% 0",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              position: "relative",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: "var(--background)",
                transformOrigin: "0 0",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                width: "1600px",
                height: "900px",
                margin: "280px auto auto",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                transform: `translate(${baseTransform.translateX}%) scale(${baseTransform.scale}) rotateX(${baseTransform.rotateX}deg) rotateY(${baseTransform.rotateY}deg) rotate(${baseTransform.rotateZ}deg)`,
                transformStyle: "preserve-3d",
                overflow: "hidden",
              }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
