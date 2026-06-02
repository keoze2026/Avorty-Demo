"use client";

import Link from "next/link";

import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section id="cta" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground tracking-tight mb-4">
              {t("marketingUI.cta.heading")}
            </h2>
            <p className="text-muted-foreground max-w-lg">
              {t("marketingUI.cta.description")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-5 py-2.5 border border-border text-foreground font-medium rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              {t("marketingUI.cta.bookDemo")}
            </button>
            <Link
              href={ROUTES.signup}
              className="px-5 py-2.5 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors text-sm inline-flex items-center gap-2"
            >
              {t("marketingUI.cta.startFree")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
