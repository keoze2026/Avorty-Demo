import type { Metadata } from "next";
import { Store } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { LiveBadge } from "@/components/shared/live-badge";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <>
      <PageHeader
        title="Marketplace"
        description="Real-time bidding for the verticals you sell into."
        actions={<LiveBadge label="Bidding" />}
      />
      <EmptyState
        icon={Store}
        tone="amber"
        title="Marketplace arrives in Phase 7"
        description="Live listings, animated bid ticker, and a bid-placement flow with per-vertical pricing."
      />
    </>
  );
}
