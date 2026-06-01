"use client";

import { useMemo, useState } from "react";
import { Building2, DollarSign, Eye, Gauge, Mail, UserSquare } from "lucide-react";
import { toast } from "sonner";

import { ErrorLine, SaveBar } from "@/components/campaigns/campaign-settings-tab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBuyersStore } from "@/lib/store/buyers-store";
import {
  REPORTING_COLUMNS,
  useBuyerReportingStore,
} from "@/lib/store/buyer-reporting-store";
import type { Buyer, BuyerPayoutModel } from "@/lib/types";

interface FormState {
  name: string;
  organization: string;
  contactName: string;
  email: string;
  description: string;
  bidAmount: number;
  payoutModel: BuyerPayoutModel;
  concurrencyCap: number;
  dailyCap: number;
  monthlyCap: number;
}

function fromBuyer(b: Buyer): FormState {
  return {
    name: b.name,
    organization: b.organization,
    contactName: b.contactName ?? "",
    email: b.email ?? "",
    description: b.description ?? "",
    bidAmount: b.bidAmount,
    payoutModel: b.payoutModel,
    concurrencyCap: b.concurrencyCap,
    dailyCap: b.dailyCap,
    monthlyCap: b.monthlyCap,
  };
}

export function BuyerSettingsTab({ buyer }: { buyer: Buyer }) {
  const update = useBuyersStore((s) => s.update);
  const reporting = useBuyerReportingStore((s) => s.byBuyer[buyer.id]) ?? {
    incoming: true,
    connected: true,
    qualified: true,
    notConnected: true,
    acl: true,
    tcl: true,
    cost: true,
  };
  const toggleReportingColumn = useBuyerReportingStore(
    (s) => s.toggleReportingColumn,
  );
  const visibleCount = REPORTING_COLUMNS.filter((c) => reporting[c.key]).length;
  const [form, setForm] = useState<FormState>(() => fromBuyer(buyer));
  const [submitting, setSubmitting] = useState(false);

  const baseline = useMemo(() => fromBuyer(buyer), [buyer]);
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = async () => {
    if (hasErrors) {
      toast.error("Please fix the highlighted fields first");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    update(buyer.id, {
      name: form.name.trim(),
      organization: form.organization.trim(),
      contactName: form.contactName.trim() || undefined,
      email: form.email.trim() || undefined,
      description: form.description.trim() || undefined,
      bidAmount: form.bidAmount,
      payoutModel: form.payoutModel,
      concurrencyCap: form.concurrencyCap,
      dailyCap: form.dailyCap,
      monthlyCap: form.monthlyCap,
    });
    setSubmitting(false);
    toast.success("Buyer settings saved");
  };
  const onDiscard = () => {
    setForm(baseline);
    toast.info("Discarded unsaved changes");
  };

  return (
    <div className="space-y-4">
      {/* Identity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-accent" />
            Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bs-name">Buyer name</Label>
            <Input
              id="bs-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && <ErrorLine>{errors.name}</ErrorLine>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bs-org">Organization</Label>
            <Input
              id="bs-org"
              value={form.organization}
              onChange={(e) => set("organization", e.target.value)}
              aria-invalid={!!errors.organization}
            />
            {errors.organization && <ErrorLine>{errors.organization}</ErrorLine>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bs-desc">Notes</Label>
            <Textarea
              id="bs-desc"
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Vertical, geo, anything routing-affecting."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserSquare className="h-4 w-4 text-accent" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bs-contact">Contact name</Label>
            <Input
              id="bs-contact"
              value={form.contactName}
              onChange={(e) => set("contactName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bs-email" className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="bs-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <ErrorLine>{errors.email}</ErrorLine>}
          </div>
        </CardContent>
      </Card>

      {/* Bidding */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-accent" />
            Bidding
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bs-bid">Bid per call (USD)</Label>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="bs-bid"
                type="number"
                min={0}
                step="0.5"
                value={form.bidAmount}
                onChange={(e) => set("bidAmount", parseFloat(e.target.value) || 0)}
                className="pl-8 font-mono"
                aria-invalid={!!errors.bidAmount}
              />
            </div>
            {errors.bidAmount && <ErrorLine>{errors.bidAmount}</ErrorLine>}
          </div>
          <div className="space-y-2">
            <Label>Payout model</Label>
            <Select
              value={form.payoutModel}
              onValueChange={(v) => set("payoutModel", v as BuyerPayoutModel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="tiered">Tiered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Caps */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="h-4 w-4 text-accent" />
            Caps &amp; pacing
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bs-conc">Concurrency</Label>
            <Input
              id="bs-conc"
              type="number"
              min={1}
              value={form.concurrencyCap}
              onChange={(e) => set("concurrencyCap", Math.max(1, parseInt(e.target.value) || 1))}
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground">Parallel calls allowed.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bs-daily">Daily cap</Label>
            <Input
              id="bs-daily"
              type="number"
              min={0}
              value={form.dailyCap}
              onChange={(e) => set("dailyCap", Math.max(0, parseInt(e.target.value) || 0))}
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground">0 = unlimited.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bs-monthly">Monthly cap</Label>
            <Input
              id="bs-monthly"
              type="number"
              min={0}
              value={form.monthlyCap}
              onChange={(e) => set("monthlyCap", Math.max(0, parseInt(e.target.value) || 0))}
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground">0 = unlimited.</p>
          </div>
        </CardContent>
      </Card>

      {/* Reporting visibility — admin-controlled column allowlist for the
          buyer's view of reporting. Defaults to every column on. */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-accent" />
            Reporting visibility
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Pick which reporting columns this buyer can see — uncheck to hide. {visibleCount} of {REPORTING_COLUMNS.length} visible.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {REPORTING_COLUMNS.map((col) => {
              const id = `brpt-${col.key}`;
              const checked = !!reporting[col.key];
              return (
                <li key={col.key}>
                  <label
                    htmlFor={id}
                    className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary/40"
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggleReportingColumn(buyer.id, col.key)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium leading-tight">
                        {col.label}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {col.description}
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <SaveBar
        dirty={dirty}
        submitting={submitting}
        hasErrors={hasErrors}
        onSave={onSave}
        onDiscard={onDiscard}
      />
    </div>
  );
}

function validate(form: FormState) {
  const errs: Record<string, string> = {};
  if (form.name.trim().length < 2) errs.name = "Name is required.";
  if (form.organization.trim().length < 2) errs.organization = "Organization is required.";
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Doesn't look like a valid email.";
  if (form.bidAmount < 0) errs.bidAmount = "Bid can't be negative.";
  return errs;
}
