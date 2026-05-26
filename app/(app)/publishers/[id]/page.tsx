"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Hash, LayoutDashboard, Megaphone, Receipt, Settings as SettingsIcon, Users } from "lucide-react";

import { PublisherCampaignsTab } from "@/components/publishers/publisher-campaigns-tab";
import { PublisherDetailHeader } from "@/components/publishers/publisher-detail-header";
import { PublisherNumbersTab } from "@/components/publishers/publisher-numbers-tab";
import { PublisherOverviewTab } from "@/components/publishers/publisher-overview-tab";
import { PublisherPayoutsTab } from "@/components/publishers/publisher-payouts-tab";
import { PublisherSettingsTab } from "@/components/publishers/publisher-settings-tab";
import { PublisherStatsRow } from "@/components/publishers/publisher-stats-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbOverride } from "@/hooks/use-breadcrumb-override";
import { usePublishersStore } from "@/lib/store/publishers-store";

export default function PublisherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const publisher = usePublishersStore((s) => s.getById(params.id));

  useBreadcrumbOverride(publisher?.name);

  useEffect(() => {
    if (!publisher) {
      const t = setTimeout(() => router.replace("/publishers"), 600);
      return () => clearTimeout(t);
    }
  }, [publisher, router]);

  if (!publisher) {
    return (
      <EmptyState
        icon={Users}
        tone="violet"
        title="Publisher not found"
        description="It may have been removed. Sending you back to the publishers list…"
      />
    );
  }

  return (
    <>
      <PublisherDetailHeader publisher={publisher} />
      <PublisherStatsRow publisher={publisher} />

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Megaphone className="h-3.5 w-3.5" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="numbers">
            <Hash className="h-3.5 w-3.5" /> Numbers
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <Receipt className="h-3.5 w-3.5" /> Payouts
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-3.5 w-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PublisherOverviewTab publisher={publisher} />
        </TabsContent>
        <TabsContent value="campaigns">
          <PublisherCampaignsTab campaignIds={publisher.campaignIds} />
        </TabsContent>
        <TabsContent value="numbers">
          <PublisherNumbersTab publisherId={publisher.id} />
        </TabsContent>
        <TabsContent value="payouts">
          <PublisherPayoutsTab publisherId={publisher.id} />
        </TabsContent>
        <TabsContent value="settings">
          <PublisherSettingsTab publisher={publisher} />
        </TabsContent>
      </Tabs>
    </>
  );
}
