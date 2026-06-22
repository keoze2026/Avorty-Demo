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

function isScheduledActive(schedule: AutoSchedule, minuteOfDay: number): boolean {
  const play = schedule.playHour * 60 + (schedule.playMinute ?? 0);
  const pause = schedule.pauseHour * 60 + (schedule.pauseMinute ?? 0);
  // Misconfigured (play == pause) — leave the entity alone.
  if (play === pause) return false;
  if (play < pause) return minuteOfDay >= play && minuteOfDay < pause;
  // Overnight range — e.g. play 22:00, pause 06:00.
  return minuteOfDay >= play || minuteOfDay < pause;
}

function getPortalMinuteOfDay(timezone: string): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const hRaw = parts.find((p) => p.type === "hour")?.value ?? "0";
    const mRaw = parts.find((p) => p.type === "minute")?.value ?? "0";
    // "24" can appear for midnight in some locales — normalize to 0.
    return (Number(hRaw) % 24) * 60 + Number(mRaw);
  } catch {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
}

export function useAutoScheduleRuntime() {
  // IMPORTANT: subscribe ONLY to the schedule maps + timezone. We deliberately
  // do NOT subscribe to the `campaigns`, `buyers`, or `destinations` arrays
  // (read them via `getState()` inside `tick` instead).
  //
  // Why: those arrays change reference on every store mutation — adding a
  // buyer, an optimistic status flip, etc. — and if `tick` is also writing
  // back to those same stores (via setStatus / setEnabled), each write
  // re-triggers the effect, re-runs tick, and we hit React error #185
  // (max update depth) on the next render cycle. By depending only on the
  // schedule maps, the effect re-installs the interval only when the user
  // actually changes a schedule.
  const portalTimezone = useAutoScheduleStore((s) => s.portalTimezone);
  const campaignSchedules = useAutoScheduleStore((s) => s.campaignSchedules);
  const buyerSchedules = useAutoScheduleStore((s) => s.buyerSchedules);
  const destinationSchedules = useAutoScheduleStore((s) => s.destinationSchedules);

  React.useEffect(() => {
    const tick = () => {
      const minuteOfDay = getPortalMinuteOfDay(portalTimezone);

      // Read the latest entity arrays + setter methods at tick time so we
      // always act on fresh data without subscribing to them.
      const campaigns = useCampaignsStore.getState().campaigns;
      const setCampaignStatus = useCampaignsStore.getState().setStatus;
      const buyers = useBuyersStore.getState().buyers;
      const setBuyerStatus = useBuyersStore.getState().setStatus;
      const destinations = useDestinationsStore.getState().destinations;
      const setDestinationEnabled = useDestinationsStore.getState().setEnabled;

      // Campaigns
      for (const [id, schedule] of Object.entries(campaignSchedules)) {
        if (!schedule.enabled) continue;
        const c = campaigns.find((x) => x.id === id);
        if (!c) continue;
        const desiredActive = isScheduledActive(schedule, minuteOfDay);
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
        const desiredActive = isScheduledActive(schedule, minuteOfDay);
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
        const desiredActive = isScheduledActive(schedule, minuteOfDay);
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
  }, [portalTimezone, campaignSchedules, buyerSchedules, destinationSchedules]);
}
