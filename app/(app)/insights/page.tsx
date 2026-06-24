"use client";

import { Badge } from "@/components/ui/badge";
import { AiBriefingHero } from "@/components/insights/ai-briefing-hero";
import { AnomalyStream } from "@/components/insights/anomaly-stream";
import { AutopilotCard } from "@/components/insights/autopilot-card";
import { RecommendationDeck } from "@/components/insights/recommendation-deck";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslation } from "@/hooks/use-translation";

export default function InsightsPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t("toolsUI.insights.pageTitle")}
        description={t("toolsUI.insights.pageDescription")}
        actions={
          <Badge variant="default" className="gap-1.5 border-accent/30 bg-accent/15 font-medium text-accent">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {t("toolsUI.insights.copilotActive")}
          </Badge>
        }
      />

      <AiBriefingHero />

      <RecommendationDeck />

      {/* Chat panel removed pending a real AI chat backend. The anomaly
          stream now uses the full row width. */}
      <AnomalyStream />

      <AutopilotCard />
    </>
  );
}
