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
import { cn } from "@/lib/utils";

interface VectorMeta {
  id: KycVectorId;
  icon: LucideIcon;
  title: string;
  blurb: string;
  /** Inline verification body — receives the vector + a "done" callback. */
  Flow: React.ComponentType<{ vector: KycVector; onSubmit: () => void }>;
}

/* ─── Per-vector verification flows ─────────────────────────────── */

function IdentityFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
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
          We use a 3-D biometric scan to bind your face to your ID. No video is stored.
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
              Scanning…
            </>
          ) : (
            <>
              <ScanFace className="h-4 w-4" />
              Start biometric scan
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
          Upload a government-issued ID. Auto-cropped, encrypted, and matched against
          the face capture.
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
          <span className="text-sm font-medium">Drop ID here or click to upload</span>
          <span className="text-[11px] text-muted-foreground">
            JPG, PNG, or PDF · max 10 MB
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
          Face + ID match: 98.4%
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Biometric match passed. Ready to submit for liveness verification.
        </p>
      </div>
      <Button onClick={onSubmit} className="w-full">
        Submit for verification
      </Button>
    </div>
  );
}

function BusinessFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
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
      toast.error("EIN must be 9 digits");
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
        We auto-pull entity records from IRS + state registries. No paperwork.
      </p>
      <div className="grid gap-1.5">
        <Label htmlFor="ein" className="text-xs">
          EIN (Employer Identification Number)
        </Label>
        <div className="flex gap-2">
          <Input
            id="ein"
            value={ein}
            onChange={(e) => setEin(e.target.value)}
            placeholder="12-3456789"
            className="font-mono"
          />
          <Button onClick={lookup} disabled={looking}>
            {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look up"}
          </Button>
        </div>
      </div>

      {found && (
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent">
            <CheckCircle2 className="h-4 w-4" />
            Entity matched
          </div>
          <dl className="grid grid-cols-2 gap-1 text-xs">
            <dt className="text-muted-foreground">Legal name</dt>
            <dd className="font-medium">{found.name}</dd>
            <dt className="text-muted-foreground">Entity type</dt>
            <dd className="font-medium">{found.type}</dd>
            <dt className="text-muted-foreground">Jurisdiction</dt>
            <dd className="font-medium">{found.state}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-[oklch(0.78_0.18_155)]">Active · Good standing</dd>
          </dl>
        </div>
      )}

      <Button onClick={onSubmit} disabled={!found} className="w-full">
        Submit for verification
      </Button>
    </div>
  );
}

function BankingFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
  const setProgress = useKycStore((s) => s.setProgress);
  const [phase, setPhase] = React.useState<"select" | "deposits" | "verify">("select");
  const [picked, setPicked] = React.useState<string | null>(null);
  const [amt1, setAmt1] = React.useState("");
  const [amt2, setAmt2] = React.useState("");

  if (phase === "select") {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Connect via Plaid — we never see your password. Or we can drop two
          micro-deposits ($0.01–$0.99) tomorrow.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["Chase", "Bank of America", "Wells Fargo", "Citi", "Capital One", "Other"].map(
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
          <div className="font-semibold">Two micro-deposits sent to {picked}</div>
          <p className="mt-1 text-muted-foreground">
            Check your account in 1–2 business days. Enter the cent amounts below.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Deposit 1 (¢)</Label>
            <Input
              value={amt1}
              onChange={(e) => setAmt1(e.target.value)}
              placeholder="0.42"
              className="font-mono"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Deposit 2 (¢)</Label>
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
          Verify deposits
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
          <CheckCircle2 className="h-4 w-4" />
          {picked} · checking ****4218
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Account verified. Payouts will land in 1 business day once your tier is unlocked.
        </p>
      </div>
      <Button onClick={onSubmit} className="w-full">
        Submit for verification
      </Button>
    </div>
  );
}

function ComplianceFlow({ vector, onSubmit }: { vector: KycVector; onSubmit: () => void }) {
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
        title="TCPA acknowledgment"
        body="I have express written consent for every number I route, with audit trail."
      />
      <CheckRow
        checked={checks.dnc}
        onToggle={() => toggle("dnc")}
        title="Federal DNC scrub"
        body="My lists are scrubbed against the National Do Not Call Registry at most 31 days before dial."
      />
      <CheckRow
        checked={checks.audit}
        onToggle={() => toggle("audit")}
        title="Sample call audit"
        body="I authorize Vortyx to audit 5 random calls in the next 7 days for compliance signals."
      />
      <Button onClick={onSubmit} disabled={!all} className="w-full">
        Submit for verification
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
  // Reputation can't be manually verified — it accrues from real traffic.
  // We just surface the live components so the operator understands what
  // moves the needle.
  const factors = [
    { label: "Call answer rate", value: 0.84, weight: "high" as const },
    { label: "Buyer complaint rate", value: 0.92, weight: "high" as const, invert: true },
    { label: "Account age", value: vector.progress, weight: "medium" as const },
    { label: "Compliance events", value: 1.0, weight: "low" as const, invert: true },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Reputation isn&apos;t a one-time check — it accrues from your traffic. Keep
        answer rates up and complaints down to climb tiers.
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
        Auto-recalculates every 24 hours. Next refresh in 17 h.
      </div>
    </div>
  );
}

/* ─── Vector registry ─────────────────────────────────────────────── */

const VECTORS: VectorMeta[] = [
  {
    id: "identity",
    icon: ScanFace,
    title: "Identity",
    blurb: "Biometric face + government ID match.",
    Flow: IdentityFlow,
  },
  {
    id: "business",
    icon: Building2,
    title: "Business",
    blurb: "EIN lookup + entity registration check.",
    Flow: BusinessFlow,
  },
  {
    id: "banking",
    icon: CreditCard,
    title: "Banking",
    blurb: "Micro-deposit account verification for payouts.",
    Flow: BankingFlow,
  },
  {
    id: "compliance",
    icon: ShieldCheck,
    title: "Compliance",
    blurb: "TCPA + DNC acknowledgment and sample-call audit.",
    Flow: ComplianceFlow,
  },
  {
    id: "reputation",
    icon: Star,
    title: "Reputation",
    blurb: "Continuously scored from real traffic quality.",
    Flow: ReputationFlow,
  },
];

/* ─── Card ────────────────────────────────────────────────────────── */

function StatusPill({ vector }: { vector: KycVector }) {
  const map: Record<KycVector["status"], { label: string; className: string }> = {
    locked: {
      label: "Locked",
      className: "bg-secondary text-muted-foreground border-border",
    },
    "in-progress": {
      label: "In progress",
      className:
        "bg-[oklch(0.78_0.14_220)]/15 text-[oklch(0.82_0.14_220)] border-[oklch(0.82_0.14_220)]/30",
    },
    review: {
      label: "Under review",
      className:
        "bg-[oklch(0.82_0.16_75)]/15 text-[oklch(0.82_0.16_75)] border-[oklch(0.82_0.16_75)]/30",
    },
    verified: {
      label: "Verified",
      className:
        "bg-[oklch(0.78_0.18_155)]/15 text-[oklch(0.78_0.18_155)] border-[oklch(0.78_0.18_155)]/30",
    },
    expired: {
      label: "Expired",
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
      {p.label}
    </span>
  );
}

export function VectorCard({ meta }: { meta: VectorMeta }) {
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
    toast.success(`${meta.title} submitted for review`);
    // Simulate a 3-second auto-approve so the demo feels responsive.
    setTimeout(() => {
      verify(meta.id);
      toast.success(`${meta.title} verified · +${weight} trust points`);
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
            <h3 className="text-sm font-semibold">{meta.title}</h3>
            <StatusPill vector={vector} />
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              +{weight} pts
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{meta.blurb}</p>
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
                Verified · re-checks every 90 days
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reset(meta.id)}
                className="h-7 text-xs"
              >
                Re-verify
              </Button>
            </>
          ) : vector.status === "review" ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Auto-approving… (typical 3 s)
            </span>
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">
                {vector.status === "locked"
                  ? "Not started"
                  : `${Math.round(vector.progress * 100)}% complete`}
              </span>
              <Button
                size="sm"
                variant={expanded ? "outline" : "default"}
                onClick={() => setExpanded((v) => !v)}
                className="h-7 text-xs"
              >
                {expanded ? "Close" : vector.status === "locked" ? "Start" : "Continue"}
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
