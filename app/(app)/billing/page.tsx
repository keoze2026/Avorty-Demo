import type { Metadata } from "next";

import { InvoicesTable } from "@/components/billing/invoices-table";
import { PaymentMethodCard } from "@/components/billing/payment-method-card";
import { SubscriptionHero } from "@/components/billing/subscription-hero";
import { UsageGrid } from "@/components/billing/usage-grid";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Subscription, usage, payment method, and invoice history."
      />

      <SubscriptionHero />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UsageGrid />
        </div>
        <div>
          <PaymentMethodCard />
        </div>
      </div>

      <InvoicesTable />
    </>
  );
}
