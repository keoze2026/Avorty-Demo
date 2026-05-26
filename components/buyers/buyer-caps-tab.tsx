"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Gauge } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompact, formatCurrency } from "@/lib/format";
import type { Buyer } from "@/lib/types";

export function BuyerCapsTab({ buyer }: { buyer: Buyer }) {
  const daily = buyer.dailyCap;
  const monthly = buyer.monthlyCap;
  const dailyUsage = daily > 0 ? Math.min(1, buyer.callsToday / daily) : 0;
  const monthlyUsage = monthly > 0 ? Math.min(1, buyer.callsMonth / monthly) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <CapCard
        icon={Calendar}
        label="Daily cap"
        consumed={buyer.callsToday}
        cap={daily}
        usage={dailyUsage}
        currency={buyer.spendToday}
      />
      <CapCard
        icon={Clock}
        label="Monthly cap"
        consumed={buyer.callsMonth}
        cap={monthly}
        usage={monthlyUsage}
        currency={buyer.spendMonth}
      />

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="h-4 w-4 text-accent" />
            Concurrency &amp; pacing rules
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Hard limits applied by the routing engine before any call hits this buyer.
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Concurrency cap" value={`${buyer.concurrencyCap} parallel calls`} />
            <Field label="Bid amount" value={formatCurrency(buyer.bidAmount, true)} />
            <Field label="Payout model" value={buyer.payoutModel === "tiered" ? "Tiered" : "Flat"} />
          </dl>

          <p className="mt-6 rounded-md border border-dashed border-border/60 bg-secondary/30 p-3 text-[11px] text-muted-foreground">
            Cap values are sourced from the buyer&apos;s onboarding configuration. To
            change them, edit the buyer profile in{" "}
            <span className="font-mono text-foreground">Settings → Buyers</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CapCard({
  icon: Icon,
  label,
  consumed,
  cap,
  usage,
  currency,
}: {
  icon: typeof Calendar;
  label: string;
  consumed: number;
  cap: number;
  usage: number;
  currency: number;
}) {
  const pct = Math.round(usage * 100);
  const danger = usage > 0.85;
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${danger ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" : "bg-accent/10 text-accent"}`}>
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold">{label}</h3>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{formatCurrency(currency)}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold">{formatCompact(consumed)}</span>
          <span className="text-sm text-muted-foreground">
            / {cap === 0 ? "Unlimited" : formatCompact(cap)}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-secondary/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${
              danger
                ? "bg-gradient-to-r from-[color:var(--warning)] to-[color:var(--destructive)]"
                : "bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--vortyx-cyan)]"
            }`}
          />
        </div>

        <p className={`text-[11px] ${danger ? "text-[color:var(--warning)]" : "text-muted-foreground"}`}>
          {cap === 0 ? "No cap — accept all" : danger ? `${pct}% consumed — approaching cap` : `${pct}% consumed`}
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-semibold">{value}</dd>
    </div>
  );
}
