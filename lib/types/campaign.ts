export type CampaignStatus = "active" | "paused" | "draft" | "archived";

/** Days of the week — 0=Sun .. 6=Sat */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CampaignSchedule {
  /** Days this campaign is active */
  days: Weekday[];
  /** Hour range in 24h clock — both inclusive on start, exclusive on end. */
  startHour: number;
  endHour: number;
  /** IANA timezone, "auto" = caller's. */
  timezone: "auto" | "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles";
}

export type PayoutModel = "per-call" | "per-qualified" | "per-minute";

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  vertical: string;
  status: CampaignStatus;

  payout: number;
  payoutModel: PayoutModel;
  /** Minimum call duration in seconds for a call to qualify (per-qualified payouts only). */
  qualifyDurationSec: number;

  /** Per-day call cap. 0 = unlimited. */
  dailyCap: number;
  /** Per-month call cap. 0 = unlimited. */
  monthlyCap: number;

  schedule: CampaignSchedule;

  numbersCount: number;
  buyersCount: number;
  publishersCount: number;
  callsToday: number;
  revenueToday: number;
  conversionRate: number;

  createdAt: number;
}

/** Cosmetic mapping vertical → KPI accent color. */
export type VerticalAccent = "cyan" | "emerald" | "violet" | "amber" | "rose";

export const VERTICAL_ACCENT: Record<string, VerticalAccent> = {
  "Health Insurance": "emerald",
  "Home Services": "amber",
  Automotive: "cyan",
  Legal: "violet",
  Finance: "rose",
};
