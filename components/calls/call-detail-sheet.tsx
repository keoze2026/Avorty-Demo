"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Hash,
  MapPin,
  Phone,
  PhoneIncoming,
  PlayCircle,
  Tag,
  Users,
} from "lucide-react";

import { CallStatusBadge } from "./call-status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDuration, formatRelativeTime } from "@/lib/format";
import type { Call } from "@/lib/types";

interface Props {
  call: Call | null;
  onOpenChange: (open: boolean) => void;
}

export function CallDetailSheet({ call, onOpenChange }: Props) {
  const open = !!call;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        {call && (
          <>
            <SheetHeader className="border-b border-border/60 p-6">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span>{call.id}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{formatRelativeTime(call.startedAt)}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{new Date(call.startedAt).toLocaleString()}</span>
              </div>
              <SheetTitle className="font-mono text-lg">{call.callerNumber}</SheetTitle>
              <SheetDescription>
                <CallStatusBadge status={call.status} />
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Headline KPIs */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Duration" value={call.durationSec > 0 ? formatDuration(call.durationSec) : "—"} />
                <Stat
                  label="Payout"
                  value={call.payout > 0 ? formatCurrency(call.payout, true) : "—"}
                  highlight={call.payout > 0}
                />
                <Stat
                  label="Revenue"
                  value={call.revenue > 0 ? formatCurrency(call.revenue, true) : "—"}
                />
              </div>

              {/* Routing timeline */}
              <section className="mt-6">
                <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Routing path
                </h3>
                <ol className="mt-3 space-y-3">
                  <Step
                    icon={PhoneIncoming}
                    label="Caller"
                    value={call.callerNumber}
                    sub={call.geo.state ? `${call.geo.city}, ${call.geo.state}` : "Unknown geo"}
                  />
                  <Step
                    icon={Users}
                    label="Publisher"
                    value={call.publisherName ?? "—"}
                    sub={call.publisherId}
                    href={call.publisherId ? `${ROUTES.publishers}/${call.publisherId}` : undefined}
                  />
                  <Step
                    icon={Hash}
                    label="Tracking number"
                    value={call.destinationNumber}
                  />
                  <Step
                    icon={Tag}
                    label="Campaign"
                    value={call.campaignName}
                    sub={call.campaignId}
                    href={`${ROUTES.campaigns}/${call.campaignId}`}
                  />
                  <Step
                    icon={Building2}
                    label="Buyer"
                    value={call.buyerName ?? "Unmatched"}
                    sub={call.buyerId}
                    href={call.buyerId ? `${ROUTES.buyers}/${call.buyerId}` : undefined}
                    final
                    won={call.status === "completed"}
                  />
                </ol>
              </section>

              {/* Geo + caller meta */}
              <section className="mt-6 grid grid-cols-2 gap-3">
                <MetaCell icon={MapPin} label="Location">
                  {call.geo.state ? `${call.geo.city}, ${call.geo.state}` : "—"}
                </MetaCell>
                <MetaCell icon={Phone} label="Destination">
                  <span className="font-mono">{call.destinationNumber}</span>
                </MetaCell>
                <MetaCell icon={CheckCircle2} label="Outcome">
                  {call.status === "completed" ? "Qualified · paid" : call.status}
                </MetaCell>
                <MetaCell icon={DollarSign} label="Revenue · payout">
                  <span className="font-mono">
                    {call.revenue > 0 ? formatCurrency(call.revenue, true) : "—"} /{" "}
                    {call.payout > 0 ? formatCurrency(call.payout, true) : "—"}
                  </span>
                </MetaCell>
              </section>

              {/* Recording placeholder */}
              <section className="mt-6 rounded-lg border border-dashed border-border/60 bg-secondary/30 p-4 text-center">
                <PlayCircle className="mx-auto h-6 w-6 text-accent" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Recording playback ships with the call recording feature in a later phase.
                </p>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ----- helpers ----- */

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight ? "border-accent/40 bg-accent/5" : "border-border bg-secondary/30"
      }`}
    >
      <div className="font-mono text-base font-bold">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Step({
  icon: Icon,
  label,
  value,
  sub,
  href,
  final,
  won,
}: {
  icon: typeof PhoneIncoming;
  label: string;
  value: string;
  sub?: string | undefined;
  href?: string;
  final?: boolean;
  won?: boolean;
}) {
  const tone =
    final && won
      ? "border-[color:var(--success)]/40 text-[color:var(--success)] bg-[color:var(--success)]/10"
      : final
        ? "border-border text-muted-foreground bg-secondary/30"
        : "border-accent/40 text-accent bg-accent/10";

  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3"
    >
      <span className={`relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 truncate text-sm font-medium transition-colors hover:text-accent"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <div className="truncate text-sm font-medium">{value}</div>
        )}
        {sub && <div className="truncate text-[10px] font-mono text-muted-foreground/70">{sub}</div>}
      </div>
    </motion.li>
  );
}

function MetaCell({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 text-xs">{children}</div>
    </div>
  );
}
