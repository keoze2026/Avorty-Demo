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

/* ─── Capitalist payment integration ─────────────────────────────────
 *
 * Capitalist (capitalist.net) is a multi-currency payment processor used
 * widely in the pay-per-call and affiliate space. Each operator account
 * holds one or more wallets — typically USD / EUR / RUB — that can be used
 * for payouts to publishers and top-ups to the platform balance.
 */

export type CapitalistCurrency = "USD" | "EUR" | "RUB";

export interface CapitalistWallet {
  /** ISO currency code. */
  currency: CapitalistCurrency;
  /** Short visible identifier — last six of the wallet id. */
  walletId: string;
  /** Current available balance in the wallet's currency. */
  balance: number;
  /** When false, the wallet is suspended (read-only). */
  active: boolean;
}

export interface CapitalistAccount {
  /** Capitalist account number — shown masked in the UI. */
  accountId: string;
  /** Display name on the Capitalist side. */
  accountName: string;
  /** When false, the integration is disconnected (no API key on file). */
  connected: boolean;
  /** ms timestamp of the most recent successful API ping. */
  lastSyncAt?: number;
  /** All wallets attached to the account. */
  wallets: CapitalistWallet[];
}
