/**
 * Billing service — /api/billing/*.
 * Account state, invoices, transactions, payment methods, and deposit flow.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";

/* ─── Frontend shapes ─────────────────────────────────────────────────── */

export interface BillingAccount {
  id: string;
  balance: number;
  creditLimit: number;
  lowBalanceThreshold: number;
  autoRecharge: boolean;
  autoRechargeAmount: number;
  autoRechargeThreshold: number;
  currency?: string;
  status?: string;
  /** Plan-tier fields exposed via the same endpoint. Optional because not
   *  every organization is on a paid plan. */
  plan?: {
    tier: string;
    monthlyCost: number;
    callsIncluded: number;
    overageRatePerCall: number;
    renewsAt?: number;
  };
}

export interface ExpenseCategory {
  key: string;
  label: string;
  amount: number;
}

export interface ExpensesReport {
  total: number;
  categories: ExpenseCategory[];
  /** Range echoed by the backend for the request, when present. */
  rangeStart?: string;
  rangeEnd?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  totalCalls: number;
  totalRevenue: number;
  totalPayout: number;
  totalAmount: number;
  status?: string;
}

export interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  callSid?: string;
  createdAt: number;
}

export interface PaymentMethod {
  id: string;
  type: string;
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

/* ─── Wire shapes ─────────────────────────────────────────────────────── */

interface BillingAccountWire {
  id: string;
  balance: string;
  creditLimit: string;
  lowBalanceThreshold: string;
  autoRecharge: boolean;
  autoRechargeAmount: string;
  autoRechargeThreshold: string;
  currency?: string;
  status?: string;
  /** Plan fields — backend may return any subset; we'll only surface plan
   *  on the BillingAccount when the tier name is present. */
  planTier?: string;
  planMonthlyCost?: string | number;
  planCallsIncluded?: number;
  planOverageRatePerCall?: string | number;
  planRenewsAt?: string;
}

interface ExpensesWire {
  total?: string | number;
  categories?: Array<{
    key?: string;
    label?: string;
    amount?: string | number;
  }>;
  rangeStart?: string;
  rangeEnd?: string;
  /** Some shapes return a flat map { voice: 78.96, recording: 5.64, ... }
   *  rather than a categories array. We handle both. */
  [key: string]: unknown;
}

interface InvoiceWire {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  totalCalls: number;
  totalRevenue: string;
  totalPayout: string;
  totalAmount: string;
  status?: string;
}

interface TransactionWire {
  id: string;
  transactionType: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  referenceId?: string;
  callSid?: string;
  createdAt: string;
}

interface PaymentMethodWire {
  id: string;
  type: string;
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

function toNum(s: string | number | undefined, fallback = 0): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toTs(s: string | number | undefined): number {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : Date.now();
  }
  return Date.now();
}

/* ─── Public service ──────────────────────────────────────────────────── */

function wireToAccount(w: BillingAccountWire): BillingAccount {
  const plan: BillingAccount["plan"] | undefined = w.planTier
    ? {
        tier: w.planTier,
        monthlyCost: toNum(w.planMonthlyCost),
        callsIncluded: w.planCallsIncluded ?? 0,
        overageRatePerCall: toNum(w.planOverageRatePerCall),
        renewsAt: w.planRenewsAt ? toTs(w.planRenewsAt) : undefined,
      }
    : undefined;
  return {
    id: w.id,
    balance: toNum(w.balance),
    creditLimit: toNum(w.creditLimit),
    lowBalanceThreshold: toNum(w.lowBalanceThreshold),
    autoRecharge: !!w.autoRecharge,
    autoRechargeAmount: toNum(w.autoRechargeAmount),
    autoRechargeThreshold: toNum(w.autoRechargeThreshold),
    currency: w.currency,
    status: w.status,
    plan,
  };
}

export const billingService = {
  async account(): Promise<BillingAccount> {
    const w = await http.get<BillingAccountWire>("/api/billing/account");
    return wireToAccount(w);
  },

  async updateAccount(patch: Partial<BillingAccount>): Promise<BillingAccount> {
    const body: Record<string, unknown> = {};
    if (patch.lowBalanceThreshold !== undefined) body.lowBalanceThreshold = String(patch.lowBalanceThreshold);
    if (patch.autoRecharge !== undefined) body.autoRecharge = patch.autoRecharge;
    if (patch.autoRechargeAmount !== undefined) body.autoRechargeAmount = String(patch.autoRechargeAmount);
    if (patch.autoRechargeThreshold !== undefined) body.autoRechargeThreshold = String(patch.autoRechargeThreshold);
    const w = await http.patch<BillingAccountWire>("/api/billing/account", { body });
    return wireToAccount(w);
  },

  /** Categorized expenses for the period. Accepts either { categories: [...] }
   *  or a flat map shape; we normalize to ExpensesReport. */
  async expenses(query: { dateFrom?: string; dateTo?: string } = {}): Promise<ExpensesReport> {
    const wire = await http.get<ExpensesWire>("/api/billing/expenses", { query });
    const categories: ExpenseCategory[] = [];
    if (Array.isArray(wire.categories)) {
      for (const c of wire.categories) {
        categories.push({
          key: c.key ?? c.label ?? "other",
          label: c.label ?? c.key ?? "Other",
          amount: toNum(c.amount),
        });
      }
    } else {
      // Flat map fallback: every non-meta key whose value is numeric becomes a category.
      const meta = new Set(["total", "rangeStart", "rangeEnd"]);
      for (const [k, v] of Object.entries(wire)) {
        if (meta.has(k)) continue;
        if (typeof v === "number" || typeof v === "string") {
          const amount = toNum(v as string | number);
          if (Number.isFinite(amount)) categories.push({ key: k, label: k, amount });
        }
      }
    }
    return {
      total: toNum(wire.total) || categories.reduce((s, c) => s + c.amount, 0),
      categories,
      rangeStart: wire.rangeStart,
      rangeEnd: wire.rangeEnd,
    };
  },

  async invoices(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<Invoice>> {
    const res = await http.get<Paginated<InvoiceWire>>("/api/billing/invoices", { query });
    return {
      ...res,
      items: res.items.map((w) => ({
        id: w.id,
        invoiceNumber: w.invoiceNumber,
        periodStart: w.periodStart,
        periodEnd: w.periodEnd,
        totalCalls: w.totalCalls,
        totalRevenue: toNum(w.totalRevenue),
        totalPayout: toNum(w.totalPayout),
        totalAmount: toNum(w.totalAmount),
        status: w.status,
      })),
    };
  },

  async transactions(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<Transaction>> {
    const res = await http.get<Paginated<TransactionWire>>("/api/billing/transactions", { query });
    return {
      ...res,
      items: res.items.map((w) => ({
        id: w.id,
        transactionType: w.transactionType,
        amount: toNum(w.amount),
        balanceBefore: toNum(w.balanceBefore),
        balanceAfter: toNum(w.balanceAfter),
        description: w.description,
        referenceId: w.referenceId,
        callSid: w.callSid,
        createdAt: toTs(w.createdAt),
      })),
    };
  },

  async paymentMethods(): Promise<PaymentMethod[]> {
    return http.get<PaymentMethodWire[]>("/api/billing/payment-methods");
  },

  async savePaymentMethod(input: {
    type: string;
    token: string;
    isDefault?: boolean;
  }): Promise<PaymentMethod> {
    return http.post<PaymentMethodWire>("/api/billing/payment-methods", { body: input });
  },

  async deletePaymentMethod(id: string): Promise<void> {
    await http.delete(`/api/billing/payment-methods/${id}`);
  },

  /** Generic deposit — backend returns { client_secret } / { url } depending on provider. */
  async createDeposit(input: { amount: number; provider: string }): Promise<unknown> {
    return http.post("/api/billing/deposit", {
      body: { amount: String(input.amount), provider: input.provider },
    });
  },

  async confirmDeposit(input: { paymentIntentId: string }): Promise<unknown> {
    return http.post("/api/billing/deposit/confirm", { body: input });
  },

  async capitalistDeposit(input: { amount: number; currency?: string }): Promise<unknown> {
    return http.post("/api/billing/deposit/capitalist", {
      body: { amount: String(input.amount), currency: input.currency ?? "USD" },
    });
  },

  async coingateDeposit(input: { amount: number; currency: string }): Promise<unknown> {
    return http.post("/api/billing/deposit/coingate", {
      body: { amount: String(input.amount), currency: input.currency },
    });
  },
};
