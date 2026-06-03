"use client";

import { PushNotifications } from "./push-notifications";
import { useAutoScheduleRuntime } from "@/lib/auto-schedule-runtime";
import { useNotificationSimulator } from "@/lib/notification-simulator";
import { useScheduledReportsRuntime } from "@/lib/scheduled-reports-runtime";

/**
 * Mounted once at the (app) layout level. Boots every client-side runtime
 * the panel needs: the iPhone-style push banner stack, the mock alert
 * simulator, the auto-schedule runtime that flips campaigns / buyers /
 * destinations between active and paused, and the scheduled-reports
 * runtime that fires end-of-shift email digests.
 */
export function NotificationRuntime() {
  useNotificationSimulator();
  useAutoScheduleRuntime();
  useScheduledReportsRuntime();
  return <PushNotifications />;
}
