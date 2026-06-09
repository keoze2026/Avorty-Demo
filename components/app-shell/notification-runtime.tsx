"use client";

import { PushNotifications } from "./push-notifications";
import { useAutoScheduleRuntime } from "@/lib/auto-schedule-runtime";
import { useScheduledReportsRuntime } from "@/lib/scheduled-reports-runtime";

/**
 * Mounted once at the (app) layout level. Boots client-side runtimes:
 * iPhone-style push banner stack, the auto-schedule runtime that flips
 * campaigns / buyers / destinations between active and paused on schedule,
 * and the scheduled-reports runtime that fires end-of-shift email digests.
 *
 * The legacy `useNotificationSimulator()` that injected synthetic alerts
 * ("Buyer hit cap", "Acceptance dipped") has been removed — the topbar
 * dropdown now reads real AI anomalies via the AI Insights store.
 */
export function NotificationRuntime() {
  useAutoScheduleRuntime();
  useScheduledReportsRuntime();
  return <PushNotifications />;
}
