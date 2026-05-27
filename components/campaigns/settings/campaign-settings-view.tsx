"use client";

/**
 * The expanded "Settings" tab on a campaign detail page.
 *
 * Top-level tabs: General · Real-Time Bidding · Enrichment URLs · Access.
 * The General sub-tab composes four sections:
 *   1. Identity / Payout / Caps / Schedule — the existing edit form
 *   2. Tracking Numbers — the numbers wired to this campaign
 *   3. Forward Calls To — routing controls + destination priority table
 *   4. Advanced Settings — 12 collapsible feature cards
 */

import { Globe, LockKeyhole, Settings as SettingsIcon, Zap } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignSettingsTab as CampaignIdentitySection } from "@/components/campaigns/campaign-settings-tab";
import { AccessTab } from "./access-tab";
import { AdvancedSettingsList } from "./advanced-settings-cards";
import { EnrichmentTab } from "./enrichment-tab";
import { ForwardCallsSection } from "./forward-calls-section";
import { RtbTab } from "./rtb-tab";
import { TrackingNumbersSection } from "./tracking-numbers-section";
import type { Campaign } from "@/lib/types";

export function CampaignSettingsView({ campaign }: { campaign: Campaign }) {
  return (
    <Tabs defaultValue="general" className="gap-4">
      <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
        <TabsTrigger value="general">
          <SettingsIcon className="h-3.5 w-3.5" /> General
        </TabsTrigger>
        <TabsTrigger value="rtb">
          <Zap className="h-3.5 w-3.5" /> Real-Time Bidding
        </TabsTrigger>
        <TabsTrigger value="enrichment">
          <Globe className="h-3.5 w-3.5" /> Enrichment URLs
        </TabsTrigger>
        <TabsTrigger value="access">
          <LockKeyhole className="h-3.5 w-3.5" /> Access
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        {/* 1 — Identity / Payout / Caps / Schedule (the existing form) */}
        <CampaignIdentitySection campaign={campaign} />

        {/* 2 — Tracking Numbers */}
        <TrackingNumbersSection campaignId={campaign.id} />

        {/* 3 — Forward Calls To */}
        <ForwardCallsSection campaignId={campaign.id} />

        {/* 4 — Advanced Settings (12 collapsible cards) */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-wider">Advanced Settings</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Customize how incoming calls are routed to optimize the call experience.
            </p>
          </div>
          <AdvancedSettingsList campaignId={campaign.id} />
        </section>
      </TabsContent>

      <TabsContent value="rtb">
        <RtbTab campaignId={campaign.id} />
      </TabsContent>

      <TabsContent value="enrichment">
        <EnrichmentTab campaignId={campaign.id} />
      </TabsContent>

      <TabsContent value="access">
        <AccessTab campaignId={campaign.id} />
      </TabsContent>
    </Tabs>
  );
}
