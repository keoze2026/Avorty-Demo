"use client";

import { ExpensesCard } from "@/components/billing/expenses-card";
import { InvoicesTable } from "@/components/billing/invoices-table";
import { PaymentMethodCard } from "@/components/billing/payment-method-card";
import { RatesCard } from "@/components/billing/rates-card";
import { SubscriptionHero } from "@/components/billing/subscription-hero";
import { UsageGrid } from "@/components/billing/usage-grid";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslation } from "@/hooks/use-translation";

export default function BillingPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t("page.billing.title")}
        description={t("page.billing.description")}
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

      <RatesCard />
      <ExpensesCard />

      <InvoicesTable />
    </>
  );
}
