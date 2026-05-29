"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Hash } from "lucide-react";

import { CampaignDetailHeader } from "@/components/campaigns/campaign-detail-header";
import { CampaignSettingsView } from "@/components/campaigns/settings/campaign-settings-view";
import { EmptyState } from "@/components/shared/empty-state";
import { useBreadcrumbOverride } from "@/hooks/use-breadcrumb-override";
import { useCampaignsStore } from "@/lib/store/campaigns-store";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaign = useCampaignsStore((s) => s.getById(params.id));

  useBreadcrumbOverride(campaign?.name);

  useEffect(() => {
    if (!campaign) {
      const t = setTimeout(() => router.replace("/campaigns"), 600);
      return () => clearTimeout(t);
    }
  }, [campaign, router]);

  if (!campaign) {
    return (
      <EmptyState
        icon={Hash}
        tone="amber"
        title="Campaign not found"
        description="It may have been archived. Sending you back to the campaigns list…"
      />
    );
  }

  return (
    // Max-width wrapper — keeps the campaign edit form readable without
    // stretching across the whole content area.
    <div className="mx-auto w-full max-w-[928px] space-y-6">
      <CampaignDetailHeader campaign={campaign} />
      <CampaignSettingsView campaign={campaign} />
    </div>
  );
}
