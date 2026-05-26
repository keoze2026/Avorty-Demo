"use client";

/**
 * Campaign builder — 4-step dialog (Basics → Payout → Schedule → Review).
 * Submits to the local Zustand campaigns store and routes to the new detail page.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Clock, DollarSign, Loader2, Megaphone, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import { VERTICALS } from "@/lib/mock/campaigns";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import type { Campaign, PayoutModel, Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CampaignBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ["Basics", "Payout & caps", "Schedule", "Review"] as const;
type Step = (typeof STEPS)[number];

const DAY_LABELS: Array<{ id: Weekday; label: string }> = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

interface FormState {
  name: string;
  description: string;
  vertical: string;
  payout: number;
  payoutModel: PayoutModel;
  qualifyDurationSec: number;
  dailyCap: number;
  monthlyCap: number;
  days: Weekday[];
  startHour: number;
  endHour: number;
  timezone: Campaign["schedule"]["timezone"];
}

const EMPTY: FormState = {
  name: "",
  description: "",
  vertical: VERTICALS[0] ?? "Health Insurance",
  payout: 35,
  payoutModel: "per-qualified",
  qualifyDurationSec: 90,
  dailyCap: 200,
  monthlyCap: 5000,
  days: [1, 2, 3, 4, 5],
  startHour: 8,
  endHour: 20,
  timezone: "auto",
};

export function CampaignBuilder({ open, onOpenChange }: CampaignBuilderProps) {
  const router = useRouter();
  const add = useCampaignsStore((s) => s.add);

  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStepIdx(0);
    setForm(EMPTY);
    setSubmitting(false);
  };

  const onClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(reset, 200);
  };

  const step: Step = STEPS[stepIdx];

  const canAdvance = (() => {
    if (step === "Basics") return form.name.trim().length >= 3 && !!form.vertical;
    if (step === "Payout & caps") return form.payout > 0;
    if (step === "Schedule") return form.days.length > 0 && form.endHour > form.startHour;
    return true;
  })();

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const prev = () => setStepIdx((i) => Math.max(i - 1, 0));

  const onSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = add({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      vertical: form.vertical,
      status: "draft",
      payout: form.payout,
      payoutModel: form.payoutModel,
      qualifyDurationSec: form.qualifyDurationSec,
      dailyCap: form.dailyCap,
      monthlyCap: form.monthlyCap,
      schedule: {
        days: form.days,
        startHour: form.startHour,
        endHour: form.endHour,
        timezone: form.timezone,
      },
      numbersCount: 0,
      buyersCount: 0,
      publishersCount: 0,
      callsToday: 0,
      revenueToday: 0,
      conversionRate: 0,
    });
    toast.success(`Campaign "${created.name}" created`, {
      description: "Add tracking numbers and buyers to start receiving calls.",
    });
    onClose(false);
    router.push(`${ROUTES.campaigns}/${created.id}`);
  };

  const toggleDay = (d: Weekday) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort((a, b) => a - b),
    }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Megaphone className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>New campaign</DialogTitle>
              <DialogDescription>Spin up a new pay-per-call campaign in four steps.</DialogDescription>
            </div>
          </div>
          {/* Step indicator */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const done = i < stepIdx;
              const current = i === stepIdx;
              return (
                <div key={s} className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "h-1 rounded-full transition-colors",
                      done || current ? "bg-accent" : "bg-secondary",
                    )}
                  />
                  <div
                    className={cn(
                      "text-[10px] font-mono uppercase tracking-wider",
                      done || current ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {i + 1}. {s}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === "Basics" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cb-name">Name</Label>
                    <Input
                      id="cb-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Health Insurance — Tier 1"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cb-vert">Vertical</Label>
                    <Select
                      value={form.vertical}
                      onValueChange={(v) => setForm((f) => ({ ...f, vertical: v }))}
                    >
                      <SelectTrigger id="cb-vert">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VERTICALS.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cb-desc">Description</Label>
                    <Textarea
                      id="cb-desc"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Who is this campaign for and what qualifies a call?"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {step === "Payout & caps" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cb-payout">Payout (USD)</Label>
                      <div className="relative">
                        <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="cb-payout"
                          type="number"
                          min={0}
                          step="0.5"
                          value={form.payout}
                          onChange={(e) => setForm((f) => ({ ...f, payout: parseFloat(e.target.value) || 0 }))}
                          className="pl-8 font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Payout model</Label>
                      <Select
                        value={form.payoutModel}
                        onValueChange={(v) => setForm((f) => ({ ...f, payoutModel: v as PayoutModel }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per-call">Per call</SelectItem>
                          <SelectItem value="per-qualified">Per qualified call</SelectItem>
                          <SelectItem value="per-minute">Per minute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {form.payoutModel === "per-qualified" && (
                    <div className="space-y-2">
                      <Label htmlFor="cb-qual">Qualify duration (seconds)</Label>
                      <Input
                        id="cb-qual"
                        type="number"
                        min={0}
                        value={form.qualifyDurationSec}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, qualifyDurationSec: parseInt(e.target.value) || 0 }))
                        }
                        className="font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Calls shorter than this duration won't trigger a payout.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cb-daily">Daily cap</Label>
                      <Input
                        id="cb-daily"
                        type="number"
                        min={0}
                        value={form.dailyCap}
                        onChange={(e) => setForm((f) => ({ ...f, dailyCap: parseInt(e.target.value) || 0 }))}
                        className="font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground">0 = unlimited.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cb-monthly">Monthly cap</Label>
                      <Input
                        id="cb-monthly"
                        type="number"
                        min={0}
                        value={form.monthlyCap}
                        onChange={(e) => setForm((f) => ({ ...f, monthlyCap: parseInt(e.target.value) || 0 }))}
                        className="font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground">0 = unlimited.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === "Schedule" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Active days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAY_LABELS.map((d) => {
                        const active = form.days.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDay(d.id)}
                            className={cn(
                              "h-9 w-12 rounded-md border text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              active
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cb-start">Start hour</Label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="cb-start"
                          type="number"
                          min={0}
                          max={23}
                          value={form.startHour}
                          onChange={(e) => setForm((f) => ({ ...f, startHour: parseInt(e.target.value) || 0 }))}
                          className="pl-8 font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cb-end">End hour</Label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="cb-end"
                          type="number"
                          min={1}
                          max={24}
                          value={form.endHour}
                          onChange={(e) => setForm((f) => ({ ...f, endHour: parseInt(e.target.value) || 0 }))}
                          className="pl-8 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={form.timezone}
                      onValueChange={(v) => setForm((f) => ({ ...f, timezone: v as FormState["timezone"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (caller's local time)</SelectItem>
                        <SelectItem value="America/New_York">Eastern · America/New_York</SelectItem>
                        <SelectItem value="America/Chicago">Central · America/Chicago</SelectItem>
                        <SelectItem value="America/Denver">Mountain · America/Denver</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific · America/Los_Angeles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === "Review" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      {form.name || "Untitled"}
                    </div>
                    {form.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{form.description}</p>
                    )}
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <Field label="Vertical" value={form.vertical} />
                      <Field label="Payout model" value={form.payoutModel} />
                      <Field label="Payout" value={`$${form.payout.toFixed(2)}`} />
                      <Field
                        label="Qualify"
                        value={form.payoutModel === "per-qualified" ? `${form.qualifyDurationSec}s` : "—"}
                      />
                      <Field label="Daily cap" value={form.dailyCap === 0 ? "Unlimited" : form.dailyCap.toString()} />
                      <Field
                        label="Monthly cap"
                        value={form.monthlyCap === 0 ? "Unlimited" : form.monthlyCap.toString()}
                      />
                      <Field
                        label="Hours"
                        value={`${form.startHour.toString().padStart(2, "0")}:00 – ${form.endHour.toString().padStart(2, "0")}:00`}
                      />
                      <Field
                        label="Days"
                        value={DAY_LABELS.filter((d) => form.days.includes(d.id)).map((d) => d.label).join(", ")}
                      />
                      <Field label="Timezone" value={form.timezone === "auto" ? "Caller-local" : form.timezone} />
                    </dl>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    The campaign will be created in <span className="font-mono text-foreground">Draft</span> status.
                    Add numbers and buyers, then flip it active when you're ready.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-6 py-3">
          <Button variant="ghost" size="sm" onClick={prev} disabled={stepIdx === 0}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          {step !== "Review" ? (
            <Button size="sm" onClick={next} disabled={!canAdvance}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={onSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  Create campaign <Check className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-foreground text-right truncate">{value}</dd>
    </>
  );
}
