"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2, Gauge, LayoutDashboard, Megaphone, Settings as SettingsIcon } from "lucide-react";

import { BuyerCampaignsTab } from "@/components/buyers/buyer-campaigns-tab";
import { BuyerCapsTab } from "@/components/buyers/buyer-caps-tab";
import { BuyerDetailHeader } from "@/components/buyers/buyer-detail-header";
import { BuyerOverviewTab } from "@/components/buyers/buyer-overview-tab";
import { BuyerSettingsTab } from "@/components/buyers/buyer-settings-tab";
import { BuyerStatsRow } from "@/components/buyers/buyer-stats-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbOverride } from "@/hooks/use-breadcrumb-override";
import { useBuyersStore } from "@/lib/store/buyers-store";

export default function BuyerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const buyer = useBuyersStore((s) => s.getById(params.id));

  useBreadcrumbOverride(buyer?.name);

  useEffect(() => {
    if (!buyer) {
      const t = setTimeout(() => router.replace("/buyers"), 600);
      return () => clearTimeout(t);
    }
  }, [buyer, router]);

  if (!buyer) {
    return (
      <EmptyState
        icon={Building2}
        tone="emerald"
        title="Buyer not found"
        description="It may have been removed. Sending you back to the buyers list…"
      />
    );
  }

  return (
    <>
      <BuyerDetailHeader buyer={buyer} />
      <BuyerStatsRow buyer={buyer} />

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Megaphone className="h-3.5 w-3.5" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="caps">
            <Gauge className="h-3.5 w-3.5" /> Caps &amp; pacing
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-3.5 w-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <BuyerOverviewTab buyer={buyer} />
        </TabsContent>
        <TabsContent value="campaigns">
          <BuyerCampaignsTab campaignIds={buyer.campaignIds} />
        </TabsContent>
        <TabsContent value="caps">
          <BuyerCapsTab buyer={buyer} />
        </TabsContent>
        <TabsContent value="settings">
          <BuyerSettingsTab buyer={buyer} />
        </TabsContent>
      </Tabs>
    </>
  );
}
