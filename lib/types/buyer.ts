export type BuyerStatus = "active" | "paused" | "capped" | "pending";

export type BuyerPayoutModel = "flat" | "tiered";

export interface Buyer {
  id: string;
  name: string;
  organization: string;
  email?: string;
  contactName?: string;
  description?: string;
  status: BuyerStatus;

  bidAmount: number;
  payoutModel: BuyerPayoutModel;

  concurrencyCap: number;
  dailyCap: number;
  monthlyCap: number;

  callsToday: number;
  callsMonth: number;
  spendToday: number;
  spendMonth: number;
  lifetimeSpend: number;

  /** 0..1 — share of routed calls accepted */
  acceptRate: number;
  /** 0..1 — share of accepted calls that qualify / pay out */
  conversionRate: number;

  campaignIds: string[];
  createdAt: number;
}
