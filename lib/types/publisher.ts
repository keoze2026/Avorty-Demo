export type PublisherStatus = "active" | "paused" | "pending";

export interface Publisher {
  id: string;
  name: string;
  organization: string;
  email?: string;
  contactName?: string;
  description?: string;
  status: PublisherStatus;

  /** % of buyer payout passed through to this publisher */
  payoutRate: number;

  callsToday: number;
  callsMonth: number;
  revenueToday: number;
  revenueMonth: number;
  lifetimeRevenue: number;

  /** Earned but not yet paid out */
  pendingPayout: number;

  /** 0..1 share of sent calls that convert */
  conversionRate: number;

  numbersAssigned: number;
  campaignIds: string[];
  createdAt: number;
}

export type PayoutStatus = "paid" | "pending" | "processing" | "failed";

export interface PayoutRecord {
  id: string;
  publisherId: string;
  amount: number;
  callsCount: number;
  status: PayoutStatus;
  /** Period covered, e.g. "2026-05-01 → 2026-05-15" */
  period: string;
  paidAt?: number;
  scheduledFor: number;
}
