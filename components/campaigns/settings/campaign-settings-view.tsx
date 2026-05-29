"use client";

/**
 * The expanded "Settings" tab on a campaign detail page.
 *
 * Top-level tabs: General · Real-Time Bidding · Enrichment URLs · Access.
 * The General sub-tab composes three sections:
 *   1. Tracking Numbers — the numbers wired to this campaign
 *   2. Forward Calls To — routing controls + destination priority table
 *   3. Advanced Settings — 12 collapsible feature cards
 */

import * as React from "react";
import { Globe, LockKeyhole, Settings as SettingsIcon, Zap } from "lucide-react";

import { AccessTab } from "./access-tab";
import { AdvancedSettingsList } from "./advanced-settings-cards";
import { EnrichmentTab } from "./enrichment-tab";
import { ForwardCallsSection } from "./forward-calls-section";
import { RtbTab } from "./rtb-tab";
import { TrackingNumbersSection } from "./tracking-numbers-section";
import type { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabId = "general" | "rtb" | "enrichment" | "access";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "rtb", label: "Real-Time Bidding", icon: Zap },
  { id: "enrichment", label: "Enrichment URLs", icon: Globe },
  { id: "access", label: "Access", icon: LockKeyhole },
];

export function CampaignSettingsView({ campaign }: { campaign: Campaign }) {
  const [tab, setTab] = React.useState<TabId>("general");

  return (
    <div className="space-y-4">
      {/* Underline-style tab strip — matches the Call Summary tabs. */}
      <div className="flex overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
                active
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-0.5 bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === "general" && (
        <div className="space-y-6">
          {/* 1 — Tracking Numbers */}
          <TrackingNumbersSection campaignId={campaign.id} />

          {/* 2 — Forward Calls To */}
          <ForwardCallsSection campaignId={campaign.id} />

          {/* 3 — Advanced Settings (12 collapsible cards) */}
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold uppercase tracking-wider">Advanced Settings</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Customize how incoming calls are routed to optimize the call experience.
              </p>
            </div>
            <AdvancedSettingsList campaignId={campaign.id} />
          </section>
        </div>
      )}

      {tab === "rtb" && <RtbTab campaignId={campaign.id} />}
      {tab === "enrichment" && <EnrichmentTab campaignId={campaign.id} />}
      {tab === "access" && <AccessTab campaignId={campaign.id} />}
    </div>
  );
}
