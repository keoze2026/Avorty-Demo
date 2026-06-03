/**
 * Scheduled-reports runtime.
 *
 * Mounted once at the (app) layout level. Every 30 seconds it reads the
 * persisted schedule, compares the current portal-time HH:MM (in the user's
 * chosen timezone) against the scheduled HH:MM, and fires a simulated send
 * (toast + push notification) when:
 *   1. scheduled time matches the current minute, AND
 *   2. today is one of the selected weekdays, AND
 *   3. we haven't already sent within the last 12 hours.
 *
 * The "send" is a mock — in production this would POST to a server worker
 * that assembles the digest PDF/CSV and hands it to Mailgun / Postmark.
 */

"use client";

import * as React from "react";
import { toast } from "sonner";

import { useTranslation } from "@/hooks/use-translation";
import { pushNotification } from "@/lib/store/push-notifications-store";
import {
  dateToWeekday,
  useScheduledReportsStore,
} from "@/lib/store/scheduled-reports-store";

const TICK_INTERVAL_MS = 30_000;
/** Re-send guard: never fire twice within this window. */
const SEND_DEDUPE_MS = 12 * 60 * 60 * 1000; // 12 h

/** Get HH and MM in the given IANA timezone. Falls back to local clock. */
function getZonedHm(timezone: string): { hour: number; minute: number; weekdayDate: Date } {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = fmt.formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
    const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");
    const day = Number(parts.find((p) => p.type === "day")?.value ?? "1");
    // Build a Date in the zone so we can read the local weekday.
    const weekdayDate = new Date(year, month - 1, day, hour, minute);
    return { hour, minute, weekdayDate };
  } catch {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes(), weekdayDate: now };
  }
}

export function useScheduledReportsRuntime() {
  const { t } = useTranslation();
  const report = useScheduledReportsStore((s) => s.report);
  const markSent = useScheduledReportsStore((s) => s.markSent);

  // Keep the latest `t` and store handles in refs so the interval closure
  // can read fresh values without forcing a remount on every change.
  const tRef = React.useRef(t);
  const reportRef = React.useRef(report);
  const markSentRef = React.useRef(markSent);
  React.useEffect(() => {
    tRef.current = t;
  }, [t]);
  React.useEffect(() => {
    reportRef.current = report;
  }, [report]);
  React.useEffect(() => {
    markSentRef.current = markSent;
  }, [markSent]);

  React.useEffect(() => {
    const tick = () => {
      const r = reportRef.current;
      if (!r.enabled) return;
      if (r.days.length === 0) return;
      if (!r.recipient) return;

      const { hour, minute, weekdayDate } = getZonedHm(r.timezone);
      const today = dateToWeekday(weekdayDate);
      if (!r.days.includes(today)) return;

      // Match the minute, allowing ±1 minute tolerance so a slow tick
      // doesn't miss the window.
      const sameHour = hour === r.hour;
      const minuteDiff = Math.abs(minute - r.minute);
      if (!sameHour || minuteDiff > 1) return;

      // Dedupe — don't re-send within the same 12-hour window.
      if (r.lastSentAt && Date.now() - r.lastSentAt < SEND_DEDUPE_MS) return;

      // Fire the simulated send.
      const tNow = tRef.current;
      const message = tNow("settings.scheduledReports.sentToast").replace(
        "{email}",
        r.recipient,
      );
      toast.success(message);
      pushNotification({
        severity: "info",
        icon: "spark",
        title: tNow("settings.scheduledReports.sentToast").replace(
          "{email}",
          r.recipient,
        ),
        source: "Scheduled Reports",
        body: r.recipient,
      });
      markSentRef.current(Date.now());
    };

    // Fire once on mount in case the user just hit the scheduled minute,
    // then continue ticking every 30 s.
    tick();
    const id = window.setInterval(tick, TICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);
}
