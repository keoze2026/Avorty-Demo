"use client";

/**
 * CTA panel — title, description, and two buttons. Designed to live inside
 * a 2-column grid alongside the Contact panel, so the layout stacks
 * vertically regardless of viewport width. Visual treatment (rounded card,
 * thin border, slightly-lighter background) matches the Contact panel so
 * the two read as a matched pair.
 */

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <div
      id="cta"
      className="relative overflow-hidden rounded-2xl  p-6 sm:p-8"
    >
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {t("marketingUI.cta.eyebrow") === "marketingUI.cta.eyebrow"
            ? "Get started"
            : t("marketingUI.cta.eyebrow")}
        </span>
        <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          {t("marketingUI.cta.heading")}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {t("marketingUI.cta.description")}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href={ROUTES.signup}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          {t("marketingUI.cta.startFree")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          className="rounded-lg border border-border/60 bg-secondary/20 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
        >
          {t("marketingUI.cta.bookDemo")}
        </button>
      </div>
    </div>
  );
}
