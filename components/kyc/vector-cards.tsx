"use client";

import * as React from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  Loader2,
  ScanFace,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type KycVector,
  type KycVectorId,
  useKycStore,
  VECTOR_WEIGHTS,
} from "@/lib/store/kyc-store";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface VectorMeta {
  id: KycVectorId;
  icon: LucideIcon;
  titleKey: string;
  blurbKey: string;
  /** Inline verification body — receives the vector + a "done" callback. */
  Flow: React.ComponentType<{ vector: KycVector; onSubmit: () => void }>;
}

/* ─── Per-vector verification flows ─────────────────────────────── */

function IdentityFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
  const { t } = useTranslation();
  const setProgress = useKycStore((s) => s.setProgress);
  const [step, setStep] = React.useState<"face" | "id" | "confirm">("face");
  const [scanning, setScanning] = React.useState(false);

  const startFaceScan = () => {
    setScanning(true);
    setProgress(vector.id, 0.1);
    // Simulate a 2.4 s "biometric scan" with progressive feedback.
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / 2400);
      setProgress(vector.id, 0.1 + t * 0.4);
      if (t < 1) requestAnimationFrame(tick);
      else {
        setScanning(false);
        setStep("id");
      }
    };
    requestAnimationFrame(tick);
  };

  if (step === "face") {
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {t("toolsUI.trustEngine.identityFlow.intro")}
        </p>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed border-border bg-muted/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanFace
              className={cn(
                "h-16 w-16 text-muted-foreground transition-colors",
                scanning && "text-accent",
              )}
            />
          </div>
          {scanning && (
            <>
              {/* Sweeping scanline */}
              <div
                aria-hidden
                className="absolute inset-x-0 h-1 animate-[scan_2.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-accent to-transparent"
              />
              <style jsx>{`
                @keyframes scan {
                  0% {
                    top: 0;
                  }
                  100% {
                    top: 100%;
                  }
                }
              `}</style>
            </>
          )}
        </div>
        <Button onClick={startFaceScan} disabled={scanning} className="w-full">
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("toolsUI.trustEngine.identityFlow.scanning")}
            </>
          ) : (
            <>
              <ScanFace className="h-4 w-4" />
              {t("toolsUI.trustEngine.identityFlow.startScan")}
            </>
          )}
        </Button>
      </div>
    );
  }

  if (step === "id") {
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {t("toolsUI.trustEngine.identityFlow.uploadIntro")}
        </p>
        <button
          type="button"
          onClick={() => {
            setProgress(vector.id, 0.85);
            setStep("confirm");
          }}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 transition-colors hover:border-accent/50 hover:bg-accent/5"
        >
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">{t("toolsUI.trustEngine.identityFlow.dropZone")}</span>
          <span className="text-[11px] text-muted-foreground">
            {t("toolsUI.trustEngine.identityFlow.dropZoneHint")}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
          <CheckCircle2 className="h-4 w-4" />
          {t("toolsUI.trustEngine.identityFlow.matchSuccess")}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("toolsUI.trustEngine.identityFlow.matchSuccessBody")}
        </p>
      </div>
      <Button onClick={onSubmit} className="w-full">
        {t("toolsUI.trustEngine.identityFlow.submit")}
      </Button>
    </div>
  );
}

function BusinessFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
  const { t } = useTranslation();
  const setProgress = useKycStore((s) => s.setProgress);
  const [ein, setEin] = React.useState("");
  const [looking, setLooking] = React.useState(false);
  const [found, setFound] = React.useState<{
    name: string;
    state: string;
    type: string;
  } | null>(null);

  const lookup = () => {
    if (ein.replace(/\D/g, "").length < 9) {
      toast.error(t("toolsUI.trustEngine.toast.einLength"));
      return;
    }
    setLooking(true);
    setProgress(vector.id, 0.3);
    // Simulate IRS / state-registry lookup.
    setTimeout(() => {
      setFound({ name: "Vortyx Demo Co.", state: "Delaware", type: "LLC" });
      setLooking(false);
      setProgress(vector.id, 0.85);
    }, 1400);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {t("toolsUI.trustEngine.businessFlow.intro")}
      </p>
      <div className="grid gap-1.5">
        <Label htmlFor="ein" className="text-xs">
          {t("toolsUI.trustEngine.businessFlow.einLabel")}
        </Label>
        <div className="flex gap-2">
          <Input
            id="ein"
            value={ein}
            onChange={(e) => setEin(e.target.value)}
            placeholder={t("toolsUI.trustEngine.businessFlow.einPlaceholder")}
            className="font-mono"
          />
          <Button onClick={lookup} disabled={looking}>
            {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : t("toolsUI.trustEngine.businessFlow.lookup")}
          </Button>
        </div>
      </div>

      {found && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent">
            <CheckCircle2 className="h-4 w-4" />
            {t("toolsUI.trustEngine.businessFlow.matched")}
          </div>
          <dl className="grid grid-cols-2 gap-1 text-xs">
            <dt className="text-muted-foreground">{t("toolsUI.trustEngine.businessFlow.legalName")}</dt>
            <dd className="font-medium">{found.name}</dd>
            <dt className="text-muted-foreground">{t("toolsUI.trustEngine.businessFlow.entityType")}</dt>
            <dd className="font-medium">{found.type}</dd>
            <dt className="text-muted-foreground">{t("toolsUI.trustEngine.businessFlow.jurisdiction")}</dt>
            <dd className="font-medium">{found.state}</dd>
            <dt className="text-muted-foreground">{t("toolsUI.trustEngine.businessFlow.statusLabel")}</dt>
            <dd className="font-medium text-[oklch(0.78_0.18_155)]">{t("toolsUI.trustEngine.businessFlow.active")}</dd>
          </dl>
        </div>
      )}

      <Button onClick={onSubmit} disabled={!found} className="w-full">
        {t("toolsUI.trustEngine.businessFlow.submit")}
      </Button>
    </div>
  );
}

function BankingFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
  const { t } = useTranslation();
  const setProgress = useKycStore((s) => s.setProgress);
  const [phase, setPhase] = React.useState<"select" | "deposits" | "verify">("select");
  const [picked, setPicked] = React.useState<string | null>(null);
  const [amt1, setAmt1] = React.useState("");
  const [amt2, setAmt2] = React.useState("");

  if (phase === "select") {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {t("toolsUI.trustEngine.bankingFlow.intro")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["Chase", "Bank of America", "Wells Fargo", "Citi", "Capital One", t("toolsUI.trustEngine.bankingFlow.other")].map(
            (b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setPicked(b);
                  setProgress(vector.id, 0.3);
                  setPhase("deposits");
                }}
                className="flex h-12 items-center justify-center rounded-lg border border-border bg-secondary/30 px-2 text-xs font-medium transition-colors hover:border-accent/50 hover:bg-accent/5"
              >
                {b}
              </button>
            ),
          )}
        </div>
      </div>
    );
  }

  if (phase === "deposits") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-secondary/20 p-3 text-xs">
          <div className="font-semibold">{t("toolsUI.trustEngine.bankingFlow.microSent").replace("{bank}", picked ?? "")}</div>
          <p className="mt-1 text-muted-foreground">
            {t("toolsUI.trustEngine.bankingFlow.microBody")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">{t("toolsUI.trustEngine.bankingFlow.deposit1")}</Label>
            <Input
              value={amt1}
              onChange={(e) => setAmt1(e.target.value)}
              placeholder="0.42"
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">{t("toolsUI.trustEngine.bankingFlow.deposit2")}</Label>
            <Input
              value={amt2}
              onChange={(e) => setAmt2(e.target.value)}
              placeholder="0.18"
              className="font-mono"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setProgress(vector.id, 0.9);
            setPhase("verify");
          }}
          disabled={!amt1 || !amt2}
          className="w-full"
        >
          {t("toolsUI.trustEngine.bankingFlow.verifyDeposits")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
          <CheckCircle2 className="h-4 w-4" />
          {t("toolsUI.trustEngine.bankingFlow.verifiedAccount").replace("{bank}", picked ?? "")}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t("toolsUI.trustEngine.bankingFlow.verifiedBody")}
        </p>
      </div>
      <Button onClick={onSubmit} className="w-full">
        {t("toolsUI.trustEngine.bankingFlow.submit")}
      </Button>
    </div>
  );
}

function ComplianceFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
  const { t } = useTranslation();
  const setProgress = useKycStore((s) => s.setProgress);
  const [checks, setChecks] = React.useState({ tcpa: false, dnc: false, audit: false });
  const all = checks.tcpa && checks.dnc && checks.audit;
  React.useEffect(() => {
    const done =
      (checks.tcpa ? 0.3 : 0) + (checks.dnc ? 0.3 : 0) + (checks.audit ? 0.4 : 0);
    setProgress(vector.id, done);
  }, [checks, setProgress, vector.id]);

  const toggle = (key: keyof typeof checks) =>
    setChecks((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="space-y-3">
      <CheckRow
        checked={checks.tcpa}
        onToggle={() => toggle("tcpa")}
        title={t("toolsUI.trustEngine.complianceFlow.tcpaTitle")}
        body={t("toolsUI.trustEngine.complianceFlow.tcpaBody")}
      />
      <CheckRow
        checked={checks.dnc}
        onToggle={() => toggle("dnc")}
        title={t("toolsUI.trustEngine.complianceFlow.dncTitle")}
        body={t("toolsUI.trustEngine.complianceFlow.dncBody")}
      />
      <CheckRow
        checked={checks.audit}
        onToggle={() => toggle("audit")}
        title={t("toolsUI.trustEngine.complianceFlow.auditTitle")}
        body={t("toolsUI.trustEngine.complianceFlow.auditBody")}
      />
      <Button onClick={onSubmit} disabled={!all} className="w-full">
        {t("toolsUI.trustEngine.complianceFlow.submit")}
      </Button>
    </div>
  );
}

function CheckRow({
  checked,
  onToggle,
  title,
  body,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        checked
          ? "border-accent/40 bg-accent/5"
          : "border-border bg-secondary/20 hover:border-border/80",
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked ? "border-accent bg-accent text-accent-foreground" : "border-border",
        )}
      >
        {checked && <CheckCircle2 className="h-3 w-3" />}
      </span>
      <div>
        <div className="text-xs font-medium">{title}</div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{body}</p>
      </div>
    </button>
  );
}

function ReputationFlow({ vector }: { vector: KycVector; onSubmit: () => void }) {
  const { t } = useTranslation();
  // Reputation can't be manually verified — it accrues from real traffic.
  // We just surface the live components so the operator understands what
  // moves the needle.
  const factors = [
    { label: t("toolsUI.trustEngine.reputationFlow.factorAnswer"), value: 0.84, weight: "high" as const },
    { label: t("toolsUI.trustEngine.reputationFlow.factorComplaint"), value: 0.92, weight: "high" as const, invert: true },
    { label: t("toolsUI.trustEngine.reputationFlow.factorAge"), value: vector.progress, weight: "medium" as const },
    { label: t("toolsUI.trustEngine.reputationFlow.factorCompliance"), value: 1.0, weight: "low" as const, invert: true },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {t("toolsUI.trustEngine.reputationFlow.intro")}
      </p>
      <div className="space-y-2">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-mono tabular-nums">
                {Math.round(f.value * 100)}%
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-[width] duration-500"
                style={{ width: `${f.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-border bg-secondary/10 p-3 text-[11px] text-muted-foreground">
        {t("toolsUI.trustEngine.reputationFlow.autoRefresh")}
      </div>
    </div>
  );
}

/* ─── Vector registry ─────────────────────────────────────────────── */

const VECTORS: VectorMeta[] = [
  {
    id: "identity",
    icon: ScanFace,
    titleKey: "toolsUI.trustEngine.vectors.identity.title",
    blurbKey: "toolsUI.trustEngine.vectors.identity.blurb",
    Flow: IdentityFlow,
  },
  {
    id: "business",
    icon: Building2,
    titleKey: "toolsUI.trustEngine.vectors.business.title",
    blurbKey: "toolsUI.trustEngine.vectors.business.blurb",
    Flow: BusinessFlow,
  },
  {
    id: "banking",
    icon: CreditCard,
    titleKey: "toolsUI.trustEngine.vectors.banking.title",
    blurbKey: "toolsUI.trustEngine.vectors.banking.blurb",
    Flow: BankingFlow,
  },
  {
    id: "compliance",
    icon: ShieldCheck,
    titleKey: "toolsUI.trustEngine.vectors.compliance.title",
    blurbKey: "toolsUI.trustEngine.vectors.compliance.blurb",
    Flow: ComplianceFlow,
  },
  {
    id: "reputation",
    icon: Star,
    titleKey: "toolsUI.trustEngine.vectors.reputation.title",
    blurbKey: "toolsUI.trustEngine.vectors.reputation.blurb",
    Flow: ReputationFlow,
  },
];

/* ─── Card ────────────────────────────────────────────────────────── */

function StatusPill({ vector }: { vector: KycVector }) {
  const { t } = useTranslation();
  const map: Record<KycVector["status"], { labelKey: string; className: string }> = {
    locked: {
      labelKey: "toolsUI.trustEngine.status.locked",
      className: "bg-secondary text-muted-foreground border-border",
    },
    "in-progress": {
      labelKey: "toolsUI.trustEngine.status.inProgress",
      className:
        "bg-[oklch(0.78_0.14_220)]/15 text-[oklch(0.82_0.14_220)] border-[oklch(0.82_0.14_220)]/30",
    },
    review: {
      labelKey: "toolsUI.trustEngine.status.review",
      className:
        "bg-[oklch(0.82_0.16_75)]/15 text-[oklch(0.82_0.16_75)] border-[oklch(0.82_0.16_75)]/30",
    },
    verified: {
      labelKey: "toolsUI.trustEngine.status.verified",
      className:
        "bg-[oklch(0.78_0.18_155)]/15 text-[oklch(0.78_0.18_155)] border-[oklch(0.78_0.18_155)]/30",
    },
    expired: {
      labelKey: "toolsUI.trustEngine.status.expired",
      className: "bg-destructive/15 text-destructive border-destructive/30",
    },
  };
  const p = map[vector.status];
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        p.className,
      )}
    >
      {t(p.labelKey)}
    </span>
  );
}

export function VectorCard({ meta }: { meta: VectorMeta }) {
  const { t } = useTranslation();
  const vector = useKycStore((s) => s.vectors[meta.id]);
  const submit = useKycStore((s) => s.submit);
  const verify = useKycStore((s) => s.verify);
  const reset = useKycStore((s) => s.reset);
  const [expanded, setExpanded] = React.useState(false);
  const Icon = meta.icon;
  const Flow = meta.Flow;
  const weight = VECTOR_WEIGHTS[meta.id];

  // Reputation card stays expanded by default — there's nothing to "start".
  const isReputation = meta.id === "reputation";
  React.useEffect(() => {
    if (isReputation) setExpanded(true);
  }, [isReputation]);

  const handleSubmit = () => {
    submit(meta.id);
    toast.success(t("toolsUI.trustEngine.toast.submitted").replace("{title}", t(meta.titleKey)));
    // Simulate a 3-second auto-approve so the demo feels responsive.
    setTimeout(() => {
      verify(meta.id);
      toast.success(
        t("toolsUI.trustEngine.toast.verified")
          .replace("{title}", t(meta.titleKey))
          .replace("{points}", String(weight)),
      );
    }, 3000);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-start gap-4 p-5">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
            vector.status === "verified"
              ? "border-[oklch(0.78_0.18_155)]/30 bg-[oklch(0.78_0.18_155)]/10 text-[oklch(0.78_0.18_155)]"
              : "border-border bg-secondary/30 text-muted-foreground",
          )}
        >
          {vector.status === "verified" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : vector.status === "locked" ? (
            <Lock className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{t(meta.titleKey)}</h3>
            <StatusPill vector={vector} />
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("toolsUI.trustEngine.pointsBadge").replace("{points}", String(weight))}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t(meta.blurbKey)}</p>
          {vector.progress > 0 && vector.status !== "verified" && (
            <div className="mt-3">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-[width] duration-500"
                  style={{ width: `${vector.progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {!isReputation && (
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          {vector.status === "verified" ? (
            <>
              <span className="text-[11px] text-muted-foreground">
                {t("toolsUI.trustEngine.actions.verified90")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reset(meta.id)}
                className="h-7 text-xs"
              >
                {t("toolsUI.trustEngine.actions.reverify")}
              </Button>
            </>
          ) : vector.status === "review" ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t("toolsUI.trustEngine.actions.autoApproving")}
            </span>
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">
                {vector.status === "locked"
                  ? t("toolsUI.trustEngine.actions.notStarted")
                  : t("toolsUI.trustEngine.actions.percentComplete").replace(
                      "{percent}",
                      String(Math.round(vector.progress * 100)),
                    )}
              </span>
              <Button
                size="sm"
                variant={expanded ? "outline" : "default"}
                onClick={() => setExpanded((v) => !v)}
                className="h-7 text-xs"
              >
                {expanded
                  ? t("toolsUI.trustEngine.actions.close")
                  : vector.status === "locked"
                    ? t("toolsUI.trustEngine.actions.start")
                    : t("toolsUI.trustEngine.actions.continue")}
              </Button>
            </>
          )}
        </div>
      )}

      {expanded && vector.status !== "verified" && vector.status !== "review" && (
        <div className="border-t border-border bg-secondary/10 px-5 py-5">
          <Flow vector={vector} onSubmit={handleSubmit} />
        </div>
      )}
    </Card>
  );
}

export function VectorGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {VECTORS.map((m) => (
        <VectorCard key={m.id} meta={m} />
      ))}
    </div>
  );
}
