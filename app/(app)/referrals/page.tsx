"use client";

import * as React from "react";
import { Check, Copy, Gift, Mail, Users } from "lucide-react";
import { toast } from "sonner";

import { ReferralSpendChart } from "@/components/referrals/referral-spend-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/format";
import {
  MOCK_REFERRAL_CODE,
  MOCK_REFERRAL_LINK,
  MOCK_REFERRED_CLIENTS,
  REFERRAL_COMMISSION_RATE,
} from "@/lib/mock/referrals";
import { cn } from "@/lib/utils";

export default function ReferralsPage() {
  const [copied, setCopied] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(0);
  React.useEffect(() => {
    setPage(0);
  }, [pageSize]);
  const visibleClients = React.useMemo(
    () => MOCK_REFERRED_CLIENTS.slice(page * pageSize, page * pageSize + pageSize),
    [page, pageSize],
  );

  const stats = React.useMemo(() => {
    let lifetimeSpend = 0;
    let monthSpend = 0;
    let activeCount = 0;
    for (const c of MOCK_REFERRED_CLIENTS) {
      lifetimeSpend += c.lifetimeSpend;
      monthSpend += c.monthSpend;
      if (c.status === "active") activeCount += 1;
    }
    return {
      clientCount: MOCK_REFERRED_CLIENTS.length,
      activeCount,
      lifetimeEarnings: lifetimeSpend * REFERRAL_COMMISSION_RATE,
      monthEarnings: monthSpend * REFERRAL_COMMISSION_RATE,
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_REFERRAL_LINK);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const commissionPct = `${(REFERRAL_COMMISSION_RATE * 100).toFixed(0)}%`;

  return (
    <>
      <PageHeader
        title="Referral Program"
        description={`Earn ${commissionPct} of every client's lifetime spend when you bring them onto Vortyx.`}
      />

      {/* Hero — referral link + share CTA */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_320px]">
          <CardContent className="space-y-3 p-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/45 bg-accent/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
              <Gift className="h-3 w-3" />
              Referral Partner
            </div>
            <h2 className="text-lg font-semibold leading-tight">
              Refer a client. We&apos;ll send you{" "}
              <span className="text-accent">{commissionPct}</span> of every dollar they spend — forever.
            </h2>
            <p className="text-sm text-muted-foreground">
              Share your unique link with any agency or buyer. The moment they sign up
              through it, every payout they make to the network earns you a {commissionPct} partner
              commission. Paid out automatically with your monthly settlement.
            </p>

            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Your link
              </span>
              <span className="flex-1 truncate font-mono text-xs text-foreground">
                {MOCK_REFERRAL_LINK}
              </span>
              <Button size="sm" variant="outline" onClick={onCopy} className="gap-1.5">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Code
              </span>
              <span className="font-mono text-xs text-foreground">{MOCK_REFERRAL_CODE}</span>
              <span className="mx-2 h-3 w-px self-center bg-border" />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs"
                onClick={() => toast.success("Invite email composer — coming soon")}
              >
                <Mail className="h-3.5 w-3.5" /> Email a contact
              </Button>
            </div>
          </CardContent>

          {/* Lifetime earnings hero number */}
          <div className="flex flex-col justify-center gap-1 border-l border-border bg-secondary/20 p-6">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Lifetime earnings
            </span>
            <span className="text-3xl font-semibold tabular-nums text-foreground">
              {formatCurrency(stats.lifetimeEarnings)}
            </span>
            <span className="text-[11px] text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]">
              ↑ {formatCurrency(stats.monthEarnings)} earned this month
            </span>
          </div>
        </div>
      </Card>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total referrals"
          value={formatNumber(stats.clientCount)}
        />
        <StatCard
          icon={Users}
          label="Active referrals"
          value={formatNumber(stats.activeCount)}
        />
        <StatCard
          icon={Gift}
          label="Commission rate"
          value={`${(REFERRAL_COMMISSION_RATE * 100).toFixed(0)}%`}
        />
        <StatCard
          icon={Gift}
          label="This month"
          value={formatCurrency(stats.monthEarnings)}
        />
      </div>

      {/* Referred clients table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold">Referred clients</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Every client signed up through your link, with their lifetime spend and your{" "}
            {commissionPct} commission share.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-left">Client</TableHead>
                <TableHead className="text-left">Vertical</TableHead>
                <TableHead className="text-left">Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>30-day spend</TableHead>
                <TableHead>Lifetime spend</TableHead>
                <TableHead className="pr-6">Your commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClients.map((c) => {
                const commission = c.lifetimeSpend * REFERRAL_COMMISSION_RATE;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6 text-left font-medium">{c.name}</TableCell>
                    <TableCell className="text-left text-muted-foreground">
                      {c.vertical}
                    </TableCell>
                    <TableCell className="text-left text-xs text-muted-foreground">
                      {formatRelativeTime(c.joinedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === "active" ? "success" : "outline"}
                        className="capitalize"
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCurrency(c.monthSpend)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCurrency(c.lifetimeSpend)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "pr-6 font-medium tabular-nums",
                        "text-[oklch(0.5_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
                      )}
                    >
                      {formatCurrency(commission)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {MOCK_REFERRED_CLIENTS.length > pageSize && (
          <div className="border-t border-border px-6 py-3">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={MOCK_REFERRED_CLIENTS.length}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          </div>
        )}
      </Card>

      {/* Spending tracker — daily bars + your-commission line so the partner
          can see how their referred clients are pacing over time. */}
      <ReferralSpendChart />
    </>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/12 text-accent">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="mt-3 text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </Card>
  );
}
