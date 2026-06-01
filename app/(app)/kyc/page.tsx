"use client";

import * as React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

import { TrustScoreGauge } from "@/components/kyc/trust-score-gauge";
import { VectorGrid } from "@/components/kyc/vector-cards";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  selectNextTier,
  selectTier,
  selectTrustScore,
  TIERS,
  useKycStore,
  VECTOR_WEIGHTS,
  type KycVectorId,
} from "@/lib/store/kyc-store";
import { cn } from "@/lib/utils";

export default function KycPage() {
  // Subscribe to vectors so the gauge / tier ladder re-renders on every
  // verify. We can't pass `useKycStore.getState` because that would skip
  // re-renders — Zustand selectors handle reactivity for us.
  const vectors = useKycStore((s) => s.vectors);
  const score = useKycStore((s) => selectTrustScore(s));
  const tier = React.useMemo(() => selectTier(score), [score]);
  const next = React.useMemo(() => selectNextTier(score), [score]);

  const verifiedCount = Object.values(vectors).filter(
    (v) => v.status === "verified",
  ).length;
  const totalCount = Object.keys(vectors).length;

  return (
    <>
      <PageHeader
        title="Trust Engine"
        description="A continuous five-vector verification. Climb tiers to unlock higher caps, faster payouts, and marketplace access."
      />

      {/* Hero — gauge + tier ladder */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]">
          {/* Gauge column */}
          <div className="flex flex-col items-center justify-center gap-3 border-b border-border bg-secondary/15 p-6 lg:border-b-0 lg:border-r">
            <TrustScoreGauge score={score} tier={tier} next={next} />
            <div className="text-center text-[11px] text-muted-foreground">
              {verifiedCount} of {totalCount} vectors verified
            </div>
          </div>

          {/* Tier ladder */}
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold">Your tier ladder</h2>
            </div>
            <ol className="relative space-y-3 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {TIERS.map((t) => {
                const reached = score >= t.minScore;
                const current = t.id === tier.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "relative flex items-start gap-3 rounded-lg border p-3 transition-colors",
                      current
                        ? "border-accent/40 bg-accent/5"
                        : reached
                          ? "border-border bg-secondary/20"
                          : "border-border bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        reached
                          ? "border-[oklch(0.78_0.18_155)]/40 bg-[oklch(0.78_0.18_155)]/15 text-[oklch(0.78_0.18_155)]"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {reached ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <span className="font-mono text-[10px] tabular-nums">
                          {t.minScore}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            t.badgeClass,
                          )}
                        >
                          {t.label}
                        </span>
                        {current && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                            ← You are here
                          </span>
                        )}
                        <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
                          {t.minScore}+ pts
                        </span>
                      </div>
                      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {t.benefits.map((b) => (
                          <li
                            key={b}
                            className="inline-flex items-center gap-1"
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "inline-block h-1 w-1 rounded-full",
                                reached ? "bg-accent" : "bg-border",
                              )}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </div>
      </Card>

      {/* Vector grid — the actual verification work */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">Verification vectors</h2>
            <p className="text-xs text-muted-foreground">
              Complete any combination — points stack, no order required.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums text-foreground">
              {score} / 100
            </span>
            <span>pts</span>
          </div>
        </div>
        <VectorGrid />
      </div>

      {/* Why the Trust Engine is different */}
      <Card className="bg-secondary/10 p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Why a Trust Engine, not a one-time KYC
        </h3>
        <ul className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          {WHY.map((w) => (
            <li key={w.title} className="rounded-md border border-border bg-card p-3">
              <div className="text-foreground font-medium">{w.title}</div>
              <p className="mt-1 leading-relaxed">{w.body}</p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

const WHY = [
  {
    title: "Continuous, not one-shot",
    body: "Reputation accrues from real call quality every 24 h. You can climb tiers without re-uploading anything.",
  },
  {
    title: "Stackable vectors",
    body: "Five independent verifications, each worth points. Complete them in any order, no blocking dependencies.",
  },
  {
    title: "Auto-approval in seconds",
    body: "Biometric match + EIN lookup + Plaid resolve instantly. No back-office queue, no waiting on email.",
  },
];

// Keep TypeScript happy on unused imports if any side-effect type narrows.
void VECTOR_WEIGHTS;
type _VectorRef = KycVectorId;
