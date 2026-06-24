/**
 * Scheduled-reports store — backed by /api/analytics/reports/*.
 *
 * Previous version was localStorage-only and the "send" was a toast fired
 * by a FE-side runtime. Now wraps `scheduledReportsService` so the
 * preference round-trips to the backend and the backend's scheduler is the
 * source of truth for actual delivery.
 *
 * Shape mapping FE ↔ wire:
 *   FE.enabled (bool)       ↔  wire.status ("active" | "paused")
 *   FE.recipient (string)   ↔  wire.recipients[0]
 *   FE.format ("pdf"|"csv"|"both")
 *                            ↔  wire.format ("pdf"|"csv"|...)
 *                               "both" is preserved client-side via
 *                               `filters.formatChoice` since the backend's
 *                               enum is single-format.
 *   FE.days / hour / minute / timezone / sections
 *                            → stored in wire.filters as opaque JSON so the
 *                              backend can keep them for the worker, even
 *                              though its frequency enum (daily|weekly|
 *                              monthly) is coarser than the FE's per-day +
 *                              specific-time picker.
 *
 * A single workspace-scoped report is supported (the first one returned).
 * Adding a second would require a list-style UI; out of scope for now.
 */

"use client";

import { create } from "zustand";

import {
  scheduledReportsService,
  type ReportFormat as WireFormat,
  type ScheduledReport as WireReport,
} from "@/lib/api/services/scheduled-reports.service";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

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
  recipient: string;
  days: Weekday[];
  hour: number;
  minute: number;
  timezone: string;
  format: ReportFormat;
  sections: ReportSection[];
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
  /** Backend report id once one exists. Null while the user hasn't enabled
   *  the report (we don't pre-create on the backend). */
  reportId: string | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setRecipient: (email: string) => Promise<void>;
  setTime: (hour: number, minute: number) => Promise<void>;
  setTimezone: (tz: string) => Promise<void>;
  toggleDay: (day: Weekday) => Promise<void>;
  setFormat: (format: ReportFormat) => Promise<void>;
  toggleSection: (section: ReportSection) => Promise<void>;
}

/* ─── Wire ↔ FE mapping ─────────────────────────────────────────────────── */

const REPORT_NAME = "User scheduled digest";

function feFormatToWire(fe: ReportFormat): WireFormat {
  // Backend enum is single-format; "both" is preserved in filters.
  if (fe === "csv") return "csv";
  return "pdf";
}

function wireToReport(w: WireReport): ScheduledReport {
  // Filters carries FE-specific richness. Be tolerant — old rows might
  // not have it and we should still render something sensible.
  const f = w.filters ?? {};
  const formatChoice =
    typeof f.formatChoice === "string"
      ? (f.formatChoice as ReportFormat)
      : (w.format as ReportFormat) ?? "pdf";
  const days = Array.isArray(f.days)
    ? (f.days.filter((d): d is Weekday => typeof d === "string" && WEEKDAYS.includes(d as Weekday)) as Weekday[])
    : DEFAULT_REPORT.days;
  const sections = Array.isArray(f.sections)
    ? (f.sections.filter((s): s is ReportSection =>
        typeof s === "string" && REPORT_SECTIONS.includes(s as ReportSection),
      ) as ReportSection[])
    : DEFAULT_REPORT.sections;

  return {
    enabled: w.status === "active",
    recipient: w.recipients[0] ?? "",
    days,
    hour: typeof f.hour === "number" ? f.hour : DEFAULT_REPORT.hour,
    minute: typeof f.minute === "number" ? f.minute : DEFAULT_REPORT.minute,
    timezone: typeof f.timezone === "string" ? f.timezone : DEFAULT_REPORT.timezone,
    format: formatChoice === "csv" || formatChoice === "both" ? formatChoice : "pdf",
    sections,
    lastSentAt: w.lastRunAt,
  };
}

function buildCreateInput(r: ScheduledReport) {
  // The backend's frequency enum is coarser than the FE schedule. Pick the
  // best-fitting bucket so its scheduler can fire at roughly the right
  // cadence; the precise per-day + HH:MM happens via filters.
  const freq: "daily" | "weekly" | "monthly" =
    r.days.length >= 6 ? "daily" : r.days.length >= 1 ? "weekly" : "monthly";
  return {
    name: REPORT_NAME,
    frequency: freq,
    format: feFormatToWire(r.format),
    recipients: r.recipient ? [r.recipient] : [],
    filters: {
      days: r.days,
      hour: r.hour,
      minute: r.minute,
      timezone: r.timezone,
      sections: r.sections,
      formatChoice: r.format,
    },
  };
}

function buildUpdateInput(r: ScheduledReport) {
  return {
    ...buildCreateInput(r),
    status: r.enabled ? ("active" as const) : ("paused" as const),
  };
}

/* ─── Backend sync — debounced so toggle-spam coalesces ────────────────── */

const SYNC_DELAY_MS = 400;
let pendingSync: ReturnType<typeof setTimeout> | null = null;

/* ─── Store ─────────────────────────────────────────────────────────────── */

export const useScheduledReportsStore = create<Store>()((set, get) => {
  /** Sync the local report to the backend. If we don't have an id yet,
   *  create one; otherwise update. Debounced so a series of edits within
   *  ~400ms coalesce into a single PATCH. */
  function scheduleSync() {
    if (pendingSync) clearTimeout(pendingSync);
    pendingSync = setTimeout(async () => {
      pendingSync = null;
      const { report, reportId } = get();
      // Don't materialize on the backend until the user has at least set a
      // recipient — avoids junk rows for first-paint visits.
      if (!report.recipient) return;
      try {
        if (reportId) {
          const updated = await scheduledReportsService.update(reportId, buildUpdateInput(report));
          set({ reportId: updated.id });
        } else {
          const created = await scheduledReportsService.create(buildCreateInput(report));
          // Honor the user's enabled toggle even on the create-then-update path
          // (the create endpoint defaults to active).
          if (!report.enabled) {
            await scheduledReportsService.pause(created.id);
          }
          set({ reportId: created.id });
        }
      } catch {
        // Best-effort — the local copy is still correct; the user can retry
        // by toggling something else.
      }
    }, SYNC_DELAY_MS);
  }

  function patch(next: Partial<ScheduledReport>) {
    set((s) => ({ report: { ...s.report, ...next } }));
    scheduleSync();
  }

  return {
    report: DEFAULT_REPORT,
    reportId: null,
    loading: false,
    hydrated: false,
    error: null,

    hydrate: async () => {
      if (get().hydrated) return;
      set({ loading: true });
      try {
        const page = await scheduledReportsService.list({ page: 1, pageSize: 1 });
        const first = page.items[0];
        if (first) {
          set({
            report: wireToReport(first),
            reportId: first.id,
          });
        }
      } catch (e) {
        set({ error: messageFromError(e) });
      } finally {
        set({ loading: false, hydrated: true });
      }
    },

    setEnabled: async (enabled) => {
      patch({ enabled });
    },
    setRecipient: async (recipient) => {
      patch({ recipient });
    },
    setTime: async (hour, minute) => {
      patch({ hour, minute });
    },
    setTimezone: async (timezone) => {
      patch({ timezone });
    },
    toggleDay: async (day) => {
      const current = get().report.days;
      const has = current.includes(day);
      const next = has ? current.filter((d) => d !== day) : [...current, day];
      next.sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
      patch({ days: next });
    },
    setFormat: async (format) => {
      patch({ format });
    },
    toggleSection: async (section) => {
      const current = get().report.sections;
      const has = current.includes(section);
      const next = has ? current.filter((s) => s !== section) : [...current, section];
      next.sort((a, b) => REPORT_SECTIONS.indexOf(a) - REPORT_SECTIONS.indexOf(b));
      patch({ sections: next });
    },
  };
});

/* ─── Helpers ──────────────────────────────────────────────────────────── */

/** Resolve a JS Date's weekday to our Mon-anchored key. Still used by some
 *  callers (e.g. the on-screen schedule preview); kept here so imports don't
 *  break. */
export function dateToWeekday(d: Date): Weekday {
  const map: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[d.getDay()];
}

function messageFromError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Scheduled reports request failed";
}
