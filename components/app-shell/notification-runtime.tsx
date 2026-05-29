"use client";

import { PushNotifications } from "./push-notifications";
import { useNotificationSimulator } from "@/lib/notification-simulator";

/**
 * Mounted once at the (app) layout level. Renders the banner stack and
 * starts the mock real-time alert source. Split out from the layout (server
 * component) so the hook can run on the client without making the whole
 * layout client-side.
 */
export function NotificationRuntime() {
  useNotificationSimulator();
  return <PushNotifications />;
}
