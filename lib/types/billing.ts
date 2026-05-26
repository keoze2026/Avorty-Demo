/** Billing-module types. */

export type PlanTier = "Starter" | "Growth" | "Scale";

export interface SubscriptionPlan {
  tier: PlanTier;
  monthlyCost: number;
  callsIncluded: number;
  overageRatePerCall: number;
  renewsAt: number;
  trialEndsAt?: number;
}

export interface UsageMetric {
  key: "calls" | "numbers" | "publishers" | "integrations";
  label: string;
  used: number;
  included: number;
  /** Optional unit label (e.g. "$ overage / call") */
  unit?: string;
}

export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

export interface PaymentMethod {
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
}

export type InvoiceStatus = "paid" | "open" | "void" | "uncollectible";

export interface Invoice {
  id: string;
  number: string;
  date: number;
  amount: number;
  status: InvoiceStatus;
  description: string;
}
