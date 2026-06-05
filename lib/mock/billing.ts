import type { CapitalistAccount, Invoice, PaymentMethod, SubscriptionPlan, UsageMetric } from "@/lib/types";

const DAY = 1000 * 60 * 60 * 24;
const NOW = Date.now();

export const MOCK_PLAN: SubscriptionPlan = {
  tier: "Growth",
  monthlyCost: 499,
  callsIncluded: 50_000,
  overageRatePerCall: 0.012,
  renewsAt: NOW + DAY * 18,
};

export const MOCK_USAGE: UsageMetric[] = [
  { key: "calls", label: "Calls routed", used: 31_840, included: 50_000 },
  { key: "numbers", label: "Tracking numbers", used: 124, included: 250 },
  { key: "publishers", label: "Active publishers", used: 14, included: 25 },
  { key: "integrations", label: "Integrations", used: 4, included: 10 },
];

export const MOCK_PAYMENT_METHOD: PaymentMethod = {
  brand: "visa",
  last4: "4242",
  expMonth: 11,
  expYear: 2028,
  cardholderName: "Avery Quinn",
};

export const MOCK_CAPITALIST_ACCOUNT: CapitalistAccount = {
  accountId: "U•••842601",
  accountName: "Avortyx Inc.",
  connected: true,
  lastSyncAt: NOW - 1000 * 60 * 4, // ~4 minutes ago
  wallets: [
    { currency: "USD", walletId: "•••4820", balance:  48_205.50, active: true },
    { currency: "EUR", walletId: "•••2017", balance:  12_400.00, active: true },
    { currency: "RUB", walletId: "•••9051", balance: 895_500.00, active: true },
  ],
};

function pad(n: number, w = 4) {
  return n.toString().padStart(w, "0");
}

const STATUS_CYCLE: Invoice["status"][] = ["paid", "paid", "paid", "paid", "open"];

export const MOCK_INVOICES: Invoice[] = Array.from({ length: 12 }).map((_, i): Invoice => {
  const month = new Date(NOW);
  month.setMonth(month.getMonth() - i);
  return {
    id: `inv_${i + 1}`,
    number: `INV-${month.getFullYear()}-${pad(42 - i)}`,
    date: month.getTime(),
    amount: i === 0 ? 612.4 : i === 1 ? 587.1 : 499 + Math.round((Math.sin(i) + 1) * 60),
    status: i === 0 ? "open" : STATUS_CYCLE[i % STATUS_CYCLE.length],
    description: i === 0 ? "Growth + overage (mid-cycle)" : "Growth plan + usage",
  };
});
