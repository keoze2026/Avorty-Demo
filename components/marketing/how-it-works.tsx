"use client";

import { Activity, BarChart3, ChevronRight, Phone, Users } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

export function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section id="how-it-works" className="relative py-40 px-6 md:px-12 lg:px-24">
      {/* Gradient overlay at top */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "20%",
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 5%, transparent), transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-[color:var(--success)]" />
          <span className="text-muted-foreground text-sm">{t("marketingUI.howItWorks.sectionLabel")}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Section heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-8 max-w-3xl leading-[1.1] tracking-tight">
          {t("marketingUI.howItWorks.heading")}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-lg max-w-md mb-16">
          <span className="text-foreground font-medium">
            {t("marketingUI.howItWorks.descriptionBold")}
          </span>
          {t("marketingUI.howItWorks.descriptionRest")}
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StepCard
            number="01"
            icon={Phone}
            title={t("marketingUI.howItWorks.step1Title")}
            description={t("marketingUI.howItWorks.step1Description")}
          />
          <StepCard
            number="02"
            icon={Activity}
            title={t("marketingUI.howItWorks.step2Title")}
            description={t("marketingUI.howItWorks.step2Description")}
          />
          <StepCard
            number="03"
            icon={Users}
            title={t("marketingUI.howItWorks.step3Title")}
            description={t("marketingUI.howItWorks.step3Description")}
          />
          <StepCard
            number="04"
            icon={BarChart3}
            title={t("marketingUI.howItWorks.step4Title")}
            description={t("marketingUI.howItWorks.step4Description")}
          />
        </div>

        {/* Bottom two-column section */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left column — Visual routing builder */}
          <div className="border-t border-r border-b border-border pt-10 pr-10 pb-16">
            <h3 className="text-xl font-medium text-foreground/90 mb-3">{t("marketingUI.howItWorks.builderTitle")}</h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              {t("marketingUI.howItWorks.builderDescription")}
            </p>

            <div className="rounded-xl border border-border bg-card/50 p-5">
              <h4 className="text-lg font-medium text-foreground/90 mb-5">{t("marketingUI.howItWorks.builderEditorTitle")}</h4>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-muted-foreground text-sm w-20">{t("marketingUI.howItWorks.builderCampaign")}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-foreground/85 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[color:var(--success)]" />
                    Health Tier 1
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-foreground/85 text-xs">
                    {t("marketingUI.howItWorks.builderLive")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-muted-foreground text-sm w-20">{t("marketingUI.howItWorks.builderFilters")}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-foreground/85 text-xs">
                    State: TX, FL, CA
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-muted-foreground text-xs">
                    Age 65+
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-muted-foreground text-sm w-20 pt-1">{t("marketingUI.howItWorks.builderBuyers")}</span>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-foreground/85 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--success)]" />
                    Apex Insurance <span className="text-muted-foreground">50%</span>
                  </span>
                  <span className="flex items-center gap-2 text-foreground/85 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    HealthDirect <span className="text-muted-foreground">30%</span>
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground bg-transparent" />
                    {t("marketingUI.howItWorks.builderFallbackPool")} <span className="text-muted-foreground">20%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Real-time analytics */}
          <div className="border-t border-b border-border pt-10 pl-10 pb-16">
            <h3 className="text-xl font-medium text-foreground/90 mb-3">{t("marketingUI.howItWorks.analyticsTitle")}</h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              {t("marketingUI.howItWorks.analyticsDescription")}
            </p>

            <div className="relative h-48">
              <div
                className="absolute rounded-lg bg-secondary/40 border border-border/40 px-4 py-2"
                style={{ top: 0, left: "10%", width: "80%" }}
              >
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  {t("marketingUI.howItWorks.analyticsYesterday")}
                </span>
              </div>

              <div
                className="absolute rounded-lg bg-secondary/60 border border-border/50 px-4 py-2"
                style={{ top: "30px", left: "5%", width: "85%" }}
              >
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  {t("marketingUI.howItWorks.analyticsLastHour")}
                </span>
              </div>

              <div
                className="absolute rounded-xl bg-secondary/90 border border-border/60 px-5 py-4"
                style={{ top: "60px", left: 0, width: "95%" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[color:var(--success)]/20 flex items-center justify-center">
                    <span className="w-2 h-2 bg-[color:var(--success)] rounded-full animate-pulse" />
                  </span>
                  <span className="text-[color:var(--success)] font-medium text-sm">{t("marketingUI.howItWorks.analyticsLive")}</span>
                </div>
                <p className="text-foreground/85 text-sm mb-3">
                  {t("marketingUI.howItWorks.analyticsLiveStat")}
                </p>
                <span className="text-muted-foreground text-xs">{t("marketingUI.howItWorks.analyticsUpdated")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
          <StatItem value="142ms" label={t("marketingUI.howItWorks.stat1Label")} />
          <StatItem value="1.2B+" label={t("marketingUI.howItWorks.stat2Label")} />
          <StatItem value="97.4%" label={t("marketingUI.howItWorks.stat3Label")} />
          <StatItem value="12+" label={t("marketingUI.howItWorks.stat4Label")} />
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm font-mono">{number}</span>
      </div>
      <h3 className="text-foreground/90 font-medium text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold text-foreground mb-2">{value}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
