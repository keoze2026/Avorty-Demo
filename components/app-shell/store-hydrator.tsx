"use client";

/**
 * Mounts once inside the authenticated shell and triggers `fetch()` on the
 * core data stores so the dashboard, navigation badges, and detail pages
 * have data to read against. Re-runs only on full app remount, not on
 * route changes — each store keeps its own cached data.
 */

import { useEffect } from "react";

import { useAiInsightsStore } from "@/lib/store/ai-insights-store";
import { useBlockedNumbersStore } from "@/lib/store/blocked-numbers-store";
import { useBuyersStore } from "@/lib/store/buyers-store";
import { useCallsStore } from "@/lib/store/calls-store";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import { useDestinationsStore } from "@/lib/store/destinations-store";
import { useNumbersStore } from "@/lib/store/numbers-store";
import { usePublishersStore } from "@/lib/store/publishers-store";
import { useRoutingStore } from "@/lib/store/routing-store";
import { useNotificationsRulesStore } from "@/lib/store/notifications-rules-store";
import { useTcpaShieldStore } from "@/lib/store/tcpa-shield-store";
import { useVoipShieldStore } from "@/lib/store/voip-shield-store";
import { useWebhooksStore } from "@/lib/store/webhooks-store";
import { useAuthStore } from "@/lib/store/auth-store";

export function StoreHydrator() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthed) return;
    // Fire in parallel — each store handles its own loading + error state.
    void useBuyersStore.getState().fetch();
    void useCampaignsStore.getState().fetch();
    void usePublishersStore.getState().fetch();
    void useNumbersStore.getState().fetch();
    void useDestinationsStore.getState().fetch();
    void useDestinationsStore.getState().fetchStats();
    // Dashboard + reports data — KPIs, recent calls, time series.
    void useCallsStore.getState().fetchRecent();
    void useCallsStore.getState().fetchKpis();
    void useCallsStore.getState().fetchTimeSeries({ granularity: "hour" });
    // AI Insights — recommendations + anomalies (cheap, rule-based on the backend).
    void useAiInsightsStore.getState().fetchAll();
    // Suppression list — blocked numbers (blacklist).
    void useBlockedNumbersStore.getState().fetch();
    // VoIP + TCPA shields (named policies).
    void useVoipShieldStore.getState().fetch();
    void useTcpaShieldStore.getState().fetch();
    // Routing plans (visual graphs ↔ flat backend rules via routing-bridge).
    void useRoutingStore.getState().fetch();
    // Webhooks (Integrations → Webhooks section).
    void useWebhooksStore.getState().fetch();
    // Notification rules (Settings → Notifications preferences matrix).
    void useNotificationsRulesStore.getState().fetch();
  }, [isAuthed]);

  return null;
}
