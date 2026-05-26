"use client";

import { Badge } from "@/components/ui/badge";
import { AiBriefingHero } from "@/components/insights/ai-briefing-hero";
import { AiChatPanel } from "@/components/insights/ai-chat-panel";
import { AnomalyStream } from "@/components/insights/anomaly-stream";
import { AutopilotCard } from "@/components/insights/autopilot-card";
import { RecommendationDeck } from "@/components/insights/recommendation-deck";
import { PageHeader } from "@/components/shared/page-header";

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        title="AI Insights"
        description="Optimization recommendations, anomaly detection, and a co-pilot you can actually ask."
        actions={
          <Badge variant="default" className="border-accent/30 bg-accent/15 text-accent">
            ✦ Co-pilot active
          </Badge>
        }
      />

      <AiBriefingHero />

      <RecommendationDeck />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <AnomalyStream />
        <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
          <AiChatPanel />
        </div>
      </div>

      <AutopilotCard />
    </>
  );
}
