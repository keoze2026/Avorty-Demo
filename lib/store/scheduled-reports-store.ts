/**
 * Scheduled-reports store.
 *
 * Holds the user's opt-in for an automatic end-of-shift email report —
 * which days, what time, which sections, and where to send it. Persisted
 * to localStorage so the schedule survives reloads.
 *
 * The runtime in `lib/scheduled-reports-runtime.ts` checks this state every
 * minute and "sends" the report (toast + push notification) when the
 * scheduled minute hits the configured timezone.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Weekday =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export const WEEKDAYS: Weekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export type ReportFormat = "pdf" | "csv" | "both";

export type ReportSection =
  | "summary"
  | "topCampaigns"
  | "topPublishers"
  | "revenue"
  | "callDetail";

export const REPORT_SECTIONS: ReportSection[] = [
  "summary",
  "topCampaigns",
  "topPublishers",
  "revenue",
  "callDetail",
];

export interface ScheduledReport {
  enabled: boolean;
  /** Recipient email — defaults to the signed-in user's email. */
  recipient: string;
  /** Days the report is sent. Default: Mon–Fri. */
  days: Weekday[];
  /** Local hour (0-23) in the user's configured timezone. */
  hour: number;
  /** Local minute (0 / 15 / 30 / 45). */
  minute: number;
  /** IANA timezone identifier. Default: portal timezone (UTC). */
  timezone: string;
  /** Export format(s) attached to the email. */
  format: ReportFormat;
  /** Which report sections to bundle. */
  sections: ReportSection[];
  /** Last successful "send" timestamp (ms) — used by the runtime to
   *  ensure we only fire once per minute even when polling every 30s. */
  lastSentAt?: number;
}

export const DEFAULT_REPORT: ScheduledReport = {
  enabled: false,
  recipient: "",
  days: ["mon", "tue", "wed", "thu", "fri"],
  hour: 18,
  minute: 0,
  timezone: "UTC",
  format: "pdf",
  sections: ["summary", "topCampaigns", "revenue"],
};

interface Store {
  report: ScheduledReport;
  setEnabled: (enabled: boolean) => void;
  setRecipient: (email: string) => void;
  setTime: (hour: number, minute: number) => void;
  setTimezone: (tz: string) => void;
  toggleDay: (day: Weekday) => void;
  setFormat: (format: ReportFormat) => void;
  toggleSection: (section: ReportSection) => void;
  markSent: (at: number) => void;
  reset: () => void;
}

export const useScheduledReportsStore = create<Store>()(
  persist(
    (set) => ({
      report: DEFAULT_REPORT,

      setEnabled: (enabled) =>
        set((s) => ({ report: { ...s.report, enabled } })),

      setRecipient: (recipient) =>
        set((s) => ({ report: { ...s.report, recipient } })),

      setTime: (hour, minute) =>
        set((s) => ({ report: { ...s.report, hour, minute } })),

      setTimezone: (timezone) =>
        set((s) => ({ report: { ...s.report, timezone } })),

      toggleDay: (day) =>
        set((s) => {
          const has = s.report.days.includes(day);
          const next = has
            ? s.report.days.filter((d) => d !== day)
            : [...s.report.days, day];
          // Keep the canonical weekday order so the chip row reads Mon→Sun.
          next.sort(
            (a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b),
          );
          return { report: { ...s.report, days: next } };
        }),

      setFormat: (format) =>
        set((s) => ({ report: { ...s.report, format } })),

      toggleSection: (section) =>
        set((s) => {
          const has = s.report.sections.includes(section);
          const next = has
            ? s.report.sections.filter((x) => x !== section)
            : [...s.report.sections, section];
          next.sort(
            (a, b) => REPORT_SECTIONS.indexOf(a) - REPORT_SECTIONS.indexOf(b),
          );
          return { report: { ...s.report, sections: next } };
        }),

      markSent: (at) =>
        set((s) => ({ report: { ...s.report, lastSentAt: at } })),

      reset: () => set({ report: DEFAULT_REPORT }),
    }),
    {
      name: "vortyx.scheduled-reports",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

/* ─── Helpers ──────────────────────────────────────────────────────── */

/** Resolve the JS Date's weekday (0=Sun..6=Sat) to our Mon-anchored key. */
export function dateToWeekday(d: Date): Weekday {
  // JS: Sun=0, Mon=1, …, Sat=6
  // Ours: Mon=0
  const map: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[d.getDay()];
}
