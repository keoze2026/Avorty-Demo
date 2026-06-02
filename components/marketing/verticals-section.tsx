"use client";

import { useState } from "react";
import {
  ArrowRight,
  Banknote,
  Car,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Scale,
  Sun,
} from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

const verticalCards = [
  {
    id: 1,
    categoryKey: "marketingUI.verticals.health.category",
    stat: "$42",
    statLabelKey: "marketingUI.verticals.health.statLabel",
    titleKey: "marketingUI.verticals.health.title",
    icon: Heart,
  },
  {
    id: 2,
    categoryKey: "marketingUI.verticals.solar.category",
    stat: "+11%",
    statLabelKey: "marketingUI.verticals.solar.statLabel",
    titleKey: "marketingUI.verticals.solar.title",
    icon: Sun,
  },
  {
    id: 3,
    categoryKey: "marketingUI.verticals.legal.category",
    stat: "$120",
    statLabelKey: "marketingUI.verticals.legal.statLabel",
    titleKey: "marketingUI.verticals.legal.title",
    icon: Scale,
  },
  {
    id: 4,
    categoryKey: "marketingUI.verticals.auto.category",
    stat: "<150ms",
    statLabelKey: "marketingUI.verticals.auto.statLabel",
    titleKey: "marketingUI.verticals.auto.title",
    icon: Car,
  },
  {
    id: 5,
    categoryKey: "marketingUI.verticals.mortgage.category",
    stat: "23",
    statLabelKey: "marketingUI.verticals.mortgage.statLabel",
    titleKey: "marketingUI.verticals.mortgage.title",
    icon: Home,
  },
  {
    id: 6,
    categoryKey: "marketingUI.verticals.finance.category",
    stat: "44%",
    statLabelKey: "marketingUI.verticals.finance.statLabel",
    titleKey: "marketingUI.verticals.finance.title",
    icon: Banknote,
  },
];

function VerticalCard({ card }: { card: (typeof verticalCards)[0] }) {
  const { t } = useTranslation();
  const Icon = card.icon;

  return (
    <div className="flex-shrink-0 w-[calc(25%-12px)] min-w-[280px]">
      <div className="bg-card/50 border border-border/60 rounded-xl overflow-hidden h-[340px] flex flex-col">
        {/* Stat area */}
        <div className="flex-1 relative overflow-hidden p-6">
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 rounded-lg px-3 py-2 mb-4">
            <Icon className="w-4 h-4 text-accent" />
            <span className="text-2xl font-semibold text-accent">{card.stat}</span>
          </div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">{t(card.statLabelKey)}</p>

          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(to top, color-mix(in oklab, var(--background) 90%, transparent), transparent)",
            }}
          />
        </div>

        {/* Card footer */}
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{t(card.categoryKey)}</p>
              <p className="text-sm text-foreground/90 leading-snug">{t(card.titleKey)}</p>
            </div>
            <button
              type="button"
              className="flex-shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground/85 hover:border-muted-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerticalsSection() {
  const { t } = useTranslation();
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollLeft = () => setScrollPosition(Math.max(0, scrollPosition - 1));
  const scrollRight = () =>
    setScrollPosition(Math.min(verticalCards.length - 4, scrollPosition + 1));

  return (
    <section className="relative py-24">
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 5%, transparent), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
          <div className="lg:max-w-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-[color:var(--warning)]" />
              <span className="text-sm text-muted-foreground">{t("marketingUI.verticals.sectionLabel")}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
            </div>

            <h2 className="text-3xl md:text-4xl font-medium text-foreground leading-[1.1] tracking-tight">
              {t("marketingUI.verticals.headingPart1")}
              <br />
              {t("marketingUI.verticals.headingPart2")}
            </h2>
          </div>

          <p className="text-muted-foreground lg:max-w-sm lg:pt-12">
            {t("marketingUI.verticals.description")}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${scrollPosition * (100 / 4)}%)` }}
          >
            {verticalCards.map((card) => (
              <VerticalCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            onClick={scrollLeft}
            disabled={scrollPosition === 0}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            disabled={scrollPosition >= verticalCards.length - 4}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
