"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, Building2, GitFork, Hash, LayoutDashboard, Settings as SettingsIcon, Users } from "lucide-react";

import { CampaignBuyersTab } from "@/components/campaigns/campaign-buyers-tab";
import { CampaignDetailHeader } from "@/components/campaigns/campaign-detail-header";
import { CampaignNumbersTab } from "@/components/campaigns/campaign-numbers-tab";
import { CampaignOverviewTab } from "@/components/campaigns/campaign-overview-tab";
import { CampaignPublishersTab } from "@/components/campaigns/campaign-publishers-tab";
import { CampaignStatsRow } from "@/components/campaigns/campaign-stats-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <>
      <CampaignDetailHeader campaign={campaign} />
      <CampaignStatsRow campaign={campaign} />

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="numbers">
            <Hash className="h-3.5 w-3.5" /> Numbers
          </TabsTrigger>
          <TabsTrigger value="buyers">
            <Building2 className="h-3.5 w-3.5" /> Buyers
          </TabsTrigger>
          <TabsTrigger value="publishers">
            <Users className="h-3.5 w-3.5" /> Publishers
          </TabsTrigger>
          <TabsTrigger value="routing">
            <GitFork className="h-3.5 w-3.5" /> Routing
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-3.5 w-3.5" /> Performance
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-3.5 w-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CampaignOverviewTab campaign={campaign} />
        </TabsContent>
        <TabsContent value="numbers">
          <CampaignNumbersTab campaignId={campaign.id} />
        </TabsContent>
        <TabsContent value="buyers">
          <CampaignBuyersTab buyersCount={campaign.buyersCount} />
        </TabsContent>
        <TabsContent value="publishers">
          <CampaignPublishersTab publishersCount={campaign.publishersCount} />
        </TabsContent>
        <TabsContent value="routing">
          <EmptyState
            icon={GitFork}
            tone="amber"
            title="Routing builder arrives in Phase 4"
            description="A node-graph editor (React Flow) for this campaign's ring tree will live here."
          />
        </TabsContent>
        <TabsContent value="performance">
          <EmptyState
            icon={BarChart3}
            tone="emerald"
            title="Performance dive arrives in Phase 6"
            description="Cross-filter analytics scoped to this campaign — by hour, geo, publisher, buyer."
          />
        </TabsContent>
        <TabsContent value="settings">
          <EmptyState
            icon={SettingsIcon}
            tone="amber"
            title="Settings panel arrives in Phase 8"
            description="Editable campaign metadata, schedule, caps, and webhook configuration."
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
