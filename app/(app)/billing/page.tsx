import type { Metadata } from "next";
import { CreditCard } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Invoices, payouts, balances, and payment methods."
      />
      <EmptyState
        icon={CreditCard}
        tone="emerald"
        title="Billing arrives in Phase 8"
        description="Invoice list, payout schedule, balance widgets, and payment-method management."
      />
    </>
  );
}
