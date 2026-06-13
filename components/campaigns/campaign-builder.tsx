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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import { ROUTES } from "@/lib/constants";
import { useCampaignsStore } from "@/lib/store/campaigns-store";
import type { Campaign, PayoutModel, Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CampaignBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ["Basics", "Payout & caps", "Schedule", "Review"] as const;
type Step = (typeof STEPS)[number];

const STEP_KEYS: Record<Step, string> = {
  Basics: "trafficUI.campaigns.builder.steps.basics",
  "Payout & caps": "trafficUI.campaigns.builder.steps.payout",
  Schedule: "trafficUI.campaigns.builder.steps.schedule",
  Review: "trafficUI.campaigns.builder.steps.review",
};

const DAY_KEYS: Array<{ id: Weekday; key: string }> = [
  { id: 0, key: "trafficUI.common.days.sun" },
  { id: 1, key: "trafficUI.common.days.mon" },
  { id: 2, key: "trafficUI.common.days.tue" },
  { id: 3, key: "trafficUI.common.days.wed" },
  { id: 4, key: "trafficUI.common.days.thu" },
  { id: 5, key: "trafficUI.common.days.fri" },
  { id: 6, key: "trafficUI.common.days.sat" },
];

interface FormState {
  name: string;
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
  const { t } = useTranslation();
  const router = useRouter();
  const add = useCampaignsStore((s) => s.add);
  const DAY_LABELS: Array<{ id: Weekday; label: string }> = DAY_KEYS.map((d) => ({ id: d.id, label: t(d.key) }));

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
    if (step === "Basics") return form.name.trim().length >= 3;
    if (step === "Payout & caps") return form.payout > 0;
    if (step === "Schedule") return form.days.length > 0 && form.endHour > form.startHour;
    return true;
  })();

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const prev = () => setStepIdx((i) => Math.max(i - 1, 0));

  const onSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = await add({
      name: form.name.trim(),
      // Vertical is no longer collected in the wizard — backend defaults the
      // column to "other" when omitted. The `Campaign` type still requires a
      // string here, so we pass the matching default.
      vertical: "Other",
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
    toast.success(t("trafficUI.campaigns.toast.created").replace("{name}", created.name), {
      description: t("trafficUI.campaigns.toast.createdDescription"),
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
              <DialogTitle>{t("trafficUI.campaigns.builder.title")}</DialogTitle>
              <DialogDescription>{t("trafficUI.campaigns.builder.description")}</DialogDescription>
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
                    {i + 1}. {t(STEP_KEYS[s])}
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
                    <Label htmlFor="cb-name">{t("trafficUI.campaigns.builder.labels.name")}</Label>
                    <Input
                      id="cb-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder={t("trafficUI.campaigns.builder.placeholders.name")}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {step === "Payout & caps" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cb-payout">{t("trafficUI.campaigns.builder.labels.payout")}</Label>
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
                      <Label>{t("trafficUI.campaigns.builder.labels.payoutModel")}</Label>
                      <Select
                        value={form.payoutModel}
                        onValueChange={(v) => setForm((f) => ({ ...f, payoutModel: v as PayoutModel }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per-call">{t("trafficUI.campaigns.builder.payoutModel.perCall")}</SelectItem>
                          <SelectItem value="per-qualified">{t("trafficUI.campaigns.builder.payoutModel.perQualified")}</SelectItem>
                          <SelectItem value="per-minute">{t("trafficUI.campaigns.builder.payoutModel.perMinute")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {form.payoutModel === "per-qualified" && (
                    <div className="space-y-2">
                      <Label htmlFor="cb-qual">{t("trafficUI.campaigns.builder.labels.qualifyDuration")}</Label>
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
                        {t("trafficUI.campaigns.builder.qualifyHint")}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cb-daily">{t("trafficUI.campaigns.builder.labels.dailyCap")}</Label>
                      <Input
                        id="cb-daily"
                        type="number"
                        min={0}
                        value={form.dailyCap}
                        onChange={(e) => setForm((f) => ({ ...f, dailyCap: parseInt(e.target.value) || 0 }))}
                        className="font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground">{t("trafficUI.common.hint.zeroUnlimited")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cb-monthly">{t("trafficUI.campaigns.builder.labels.monthlyCap")}</Label>
                      <Input
                        id="cb-monthly"
                        type="number"
                        min={0}
                        value={form.monthlyCap}
                        onChange={(e) => setForm((f) => ({ ...f, monthlyCap: parseInt(e.target.value) || 0 }))}
                        className="font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground">{t("trafficUI.common.hint.zeroUnlimited")}</p>
                    </div>
                  </div>
                </div>
              )}

              {step === "Schedule" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>{t("trafficUI.campaigns.builder.labels.activeDays")}</Label>
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
                      <Label htmlFor="cb-start">{t("trafficUI.campaigns.builder.labels.startHour")}</Label>
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
                      <Label htmlFor="cb-end">{t("trafficUI.campaigns.builder.labels.endHour")}</Label>
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
                    <Label>{t("trafficUI.campaigns.builder.labels.timezone")}</Label>
                    <Select
                      value={form.timezone}
                      onValueChange={(v) => setForm((f) => ({ ...f, timezone: v as FormState["timezone"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">{t("trafficUI.common.timezones.callerLocalAuto")}</SelectItem>
                        <SelectItem value="America/New_York">{t("trafficUI.common.timezones.eastern")}</SelectItem>
                        <SelectItem value="America/Chicago">{t("trafficUI.common.timezones.central")}</SelectItem>
                        <SelectItem value="America/Denver">{t("trafficUI.common.timezones.mountain")}</SelectItem>
                        <SelectItem value="America/Los_Angeles">{t("trafficUI.common.timezones.pacific")}</SelectItem>
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
                      {form.name || t("trafficUI.campaigns.builder.untitled")}
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <Field label={t("trafficUI.campaigns.builder.labels.payoutModel")} value={form.payoutModel} />
                      <Field label={t("trafficUI.campaigns.builder.labels.payoutLabel")} value={`$${form.payout.toFixed(2)}`} />
                      <Field
                        label={t("trafficUI.campaigns.builder.labels.qualify")}
                        value={form.payoutModel === "per-qualified" ? `${form.qualifyDurationSec}s` : "—"}
                      />
                      <Field label={t("trafficUI.campaigns.builder.labels.dailyCap")} value={form.dailyCap === 0 ? t("trafficUI.campaigns.builder.unlimited") : form.dailyCap.toString()} />
                      <Field
                        label={t("trafficUI.campaigns.builder.labels.monthlyCap")}
                        value={form.monthlyCap === 0 ? t("trafficUI.campaigns.builder.unlimited") : form.monthlyCap.toString()}
                      />
                      <Field
                        label={t("trafficUI.campaigns.builder.labels.hours")}
                        value={`${form.startHour.toString().padStart(2, "0")}:00 – ${form.endHour.toString().padStart(2, "0")}:00`}
                      />
                      <Field
                        label={t("trafficUI.campaigns.builder.labels.days")}
                        value={DAY_LABELS.filter((d) => form.days.includes(d.id)).map((d) => d.label).join(", ")}
                      />
                      <Field label={t("trafficUI.campaigns.builder.labels.timezone")} value={form.timezone === "auto" ? t("trafficUI.common.timezones.callerLocal") : form.timezone} />
                    </dl>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("trafficUI.campaigns.builder.createdInDraft")} <span className="font-mono text-foreground">{t("trafficUI.common.draft")}</span>
                    {t("trafficUI.campaigns.builder.createdInDraftSuffix")}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-6 py-3">
          <Button variant="ghost" size="sm" onClick={prev} disabled={stepIdx === 0}>
            <ArrowLeft className="h-3.5 w-3.5" /> {t("trafficUI.common.back")}
          </Button>
          {step !== "Review" ? (
            <Button size="sm" onClick={next} disabled={!canAdvance}>
              {t("trafficUI.common.continue")} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={onSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("trafficUI.campaigns.builder.creating")}
                </>
              ) : (
                <>
                  {t("trafficUI.campaigns.createCampaign")} <Check className="h-3.5 w-3.5" />
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
