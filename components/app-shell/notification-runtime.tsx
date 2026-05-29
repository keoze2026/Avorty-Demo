"use client";

import { PushNotifications } from "./push-notifications";
import { useAutoScheduleRuntime } from "@/lib/auto-schedule-runtime";
import { useNotificationSimulator } from "@/lib/notification-simulator";

/**
 * Mounted once at the (app) layout level. Boots every client-side runtime
 * the panel needs: the iPhone-style push banner stack, the mock alert
 * simulator, and the auto-schedule runtime that flips campaigns / buyers /
 * destinations between active and paused based on the portal timezone.
 */
export function NotificationRuntime() {
  useNotificationSimulator();
  useAutoScheduleRuntime();
  return <PushNotifications />;
}
