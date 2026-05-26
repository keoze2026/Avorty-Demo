"use client";

/**
 * Inline settings editor for a single publisher.
 * Identity / Contact / Payout cards, with a sticky save bar that activates
 * when the form is dirty. Payout rate is stored as 0..1 but edited as a %.
 */

import { useMemo, useState } from "react";
import { Building2, Mail, Percent, UserSquare, Wallet } from "lucide-react";
import { toast } from "sonner";

import { ErrorLine, SaveBar } from "@/components/campaigns/campaign-settings-tab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePublishersStore } from "@/lib/store/publishers-store";
import type { Publisher } from "@/lib/types";

interface FormState {
  name: string;
  organization: string;
  contactName: string;
  email: string;
  description: string;
  /** Stored as a percentage 0..100 here for friendlier editing. */
  payoutPct: number;
}

function fromPublisher(p: Publisher): FormState {
  return {
    name: p.name,
    organization: p.organization,
    contactName: p.contactName ?? "",
    email: p.email ?? "",
    description: p.description ?? "",
    payoutPct: Math.round(p.payoutRate * 1000) / 10,
  };
}

export function PublisherSettingsTab({ publisher }: { publisher: Publisher }) {
  const update = usePublishersStore((s) => s.update);
  const [form, setForm] = useState<FormState>(() => fromPublisher(publisher));
  const [submitting, setSubmitting] = useState(false);

  const baseline = useMemo(() => fromPublisher(publisher), [publisher]);
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = async () => {
    if (hasErrors) {
      toast.error("Please fix the highlighted fields first.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    update(publisher.id, {
      name: form.name.trim(),
      organization: form.organization.trim(),
      contactName: form.contactName.trim() || undefined,
      email: form.email.trim() || undefined,
      description: form.description.trim() || undefined,
      payoutRate: Math.round(form.payoutPct * 10) / 1000,
    });
    setSubmitting(false);
    toast.success("Publisher settings saved");
  };
  const onDiscard = () => {
    setForm(baseline);
    toast.info("Discarded unsaved changes");
  };

  const previewShare = Math.max(0, Math.min(100, form.payoutPct));

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
            <Label htmlFor="ps-name">Publisher name</Label>
            <Input
              id="ps-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && <ErrorLine>{errors.name}</ErrorLine>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ps-org">Organization</Label>
            <Input
              id="ps-org"
              value={form.organization}
              onChange={(e) => set("organization", e.target.value)}
              aria-invalid={!!errors.organization}
            />
            {errors.organization && <ErrorLine>{errors.organization}</ErrorLine>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ps-desc">Notes</Label>
            <Textarea
              id="ps-desc"
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Source quality, traffic mix, anything routing-affecting."
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
            <Label htmlFor="ps-contact">Contact name</Label>
            <Input
              id="ps-contact"
              value={form.contactName}
              onChange={(e) => set("contactName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ps-email" className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="ps-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <ErrorLine>{errors.email}</ErrorLine>}
          </div>
        </CardContent>
      </Card>

      {/* Payout */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-accent" />
            Payout share
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Share of the buyer payout passed through to this publisher per qualified call.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ps-payout">Payout rate</Label>
            <div className="relative">
              <Percent className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="ps-payout"
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={form.payoutPct}
                onChange={(e) => set("payoutPct", parseFloat(e.target.value) || 0)}
                className="pl-8 font-mono"
                aria-invalid={!!errors.payoutPct}
              />
            </div>
            {errors.payoutPct && <ErrorLine>{errors.payoutPct}</ErrorLine>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Preview on a $40 buyer payout
            </Label>
            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg font-semibold text-accent">
                  ${((40 * previewShare) / 100).toFixed(2)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  to publisher · ${(40 - (40 * previewShare) / 100).toFixed(2)} kept by network
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--vortyx-cyan)]"
                  style={{ width: `${previewShare}%` }}
                />
              </div>
            </div>
          </div>
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
  if (form.payoutPct < 0 || form.payoutPct > 100) errs.payoutPct = "Payout must be between 0 and 100%.";
  return errs;
}
