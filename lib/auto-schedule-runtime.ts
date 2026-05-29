/**
 * Auto-schedule runtime.
 *
 * Mounted once at the (app) layout level. Every 30 seconds it reads the
 * portal timezone + every persisted schedule, computes the *desired* state
 * for each entity (active vs paused) at the current hour, and writes the
 * change back to that entity's Zustand store if it doesn't already match.
 *
 * Semantics: between `playHour` (inclusive) and `pauseHour` (exclusive) the
 * entity should be active. Outside that range, paused. Overnight ranges
 * (play > pause) wrap around midnight automatically.
 */

"use client";

import * as React from "react";

import {
  useAutoScheduleStore,
  type AutoSchedule,
} from "@/lib/store/auto-schedule-store";
import { useBuyersStore } from "@/lib/store/buyers-store";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import { useDestinationsStore } from "@/lib/store/destinations-store";

const TICK_INTERVAL_MS = 30_000;

function isScheduledActive(schedule: AutoSchedule, hour: number): boolean {
  const { playHour, pauseHour } = schedule;
  // Misconfigured (play == pause) — leave the entity alone.
  if (playHour === pauseHour) return false;
  if (playHour < pauseHour) return hour >= playHour && hour < pauseHour;
  // Overnight range — e.g. play 22:00, pause 06:00.
  return hour >= playHour || hour < pauseHour;
}

function getPortalHour(timezone: string): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const raw = parts.find((p) => p.type === "hour")?.value ?? "0";
    // "24" can appear for midnight in some locales — normalize to 0.
    return Number(raw) % 24;
  } catch {
    return new Date().getHours();
  }
}

export function useAutoScheduleRuntime() {
  const portalTimezone = useAutoScheduleStore((s) => s.portalTimezone);
  const campaignSchedules = useAutoScheduleStore((s) => s.campaignSchedules);
  const buyerSchedules = useAutoScheduleStore((s) => s.buyerSchedules);
  const destinationSchedules = useAutoScheduleStore((s) => s.destinationSchedules);

  const campaigns = useCampaignsStore((s) => s.campaigns);
  const buyers = useBuyersStore((s) => s.buyers);
  const destinations = useDestinationsStore((s) => s.destinations);

  const setCampaignStatus = useCampaignsStore((s) => s.setStatus);
  const setBuyerStatus = useBuyersStore((s) => s.setStatus);
  const setDestinationEnabled = useDestinationsStore((s) => s.setEnabled);

  React.useEffect(() => {
    const tick = () => {
      const hour = getPortalHour(portalTimezone);

      // Campaigns
      for (const [id, schedule] of Object.entries(campaignSchedules)) {
        if (!schedule.enabled) continue;
        const c = campaigns.find((x) => x.id === id);
        if (!c) continue;
        const desiredActive = isScheduledActive(schedule, hour);
        const currentActive = c.status === "active";
        if (desiredActive !== currentActive) {
          setCampaignStatus(id, desiredActive ? "active" : "paused");
        }
      }

      // Buyers
      for (const [id, schedule] of Object.entries(buyerSchedules)) {
        if (!schedule.enabled) continue;
        const b = buyers.find((x) => x.id === id);
        if (!b) continue;
        const desiredActive = isScheduledActive(schedule, hour);
        const currentActive = b.status === "active";
        if (desiredActive !== currentActive) {
          setBuyerStatus(id, desiredActive ? "active" : "paused");
        }
      }

      // Destinations
      for (const [id, schedule] of Object.entries(destinationSchedules)) {
        if (!schedule.enabled) continue;
        const d = destinations.find((x) => x.id === id);
        if (!d) continue;
        const desiredActive = isScheduledActive(schedule, hour);
        if (desiredActive !== d.enabled) {
          setDestinationEnabled(id, desiredActive);
        }
      }
    };

    // Fire once immediately so the page reflects the schedule on load,
    // then continue ticking every 30 seconds.
    tick();
    const id = window.setInterval(tick, TICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [
    portalTimezone,
    campaignSchedules,
    buyerSchedules,
    destinationSchedules,
    campaigns,
    buyers,
    destinations,
    setCampaignStatus,
    setBuyerStatus,
    setDestinationEnabled,
  ]);
}
