"use client";

import { PushNotifications } from "./push-notifications";
import { useAutoScheduleRuntime } from "@/lib/auto-schedule-runtime";

/**
 * Mounted once at the (app) layout level. Boots client-side runtimes:
 * iPhone-style push banner stack, and the auto-schedule runtime that flips
 * campaigns / buyers / destinations between active and paused on schedule.
 *
 * The previous `useScheduledReportsRuntime()` that fired toast/push events
 * pretending to "send" scheduled report emails has been removed — backend
 * scheduling at /api/analytics/reports/* is now the source of truth; the
 * FE just persists the user's preference and the worker delivers.
 *
 * The legacy `useNotificationSimulator()` that injected synthetic alerts
 * ("Buyer hit cap", "Acceptance dipped") has been removed — the topbar
 * dropdown now reads real AI anomalies via the AI Insights store.
 */
export function NotificationRuntime() {
  useAutoScheduleRuntime();
  return <PushNotifications />;
}
