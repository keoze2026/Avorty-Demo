import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "AI Insights" };

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        title="AI Insights"
        description="Optimization recommendations and anomaly detection across your network."
        actions={<Badge variant="outline" className="border-accent/40 text-accent">AI</Badge>}
      />
      <EmptyState
        icon={Sparkles}
        tone="violet"
        title="AI Insights arrives in Phase 9"
        description="Recommendation cards, anomaly highlights, and one-click apply actions for the AI's suggestions."
      />
    </>
  );
}
