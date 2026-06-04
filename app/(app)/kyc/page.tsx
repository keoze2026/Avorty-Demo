"use client";

import * as React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

import { TrustScoreGauge } from "@/components/kyc/trust-score-gauge";
import { VectorGrid } from "@/components/kyc/vector-cards";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
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

/** Map each English tier-benefit string to its translation key. Falls back
 *  to the raw string if a benefit is missing here. */
const BENEFIT_KEYS: Record<string, string> = {
  "Demo data only": "toolsUI.trustEngine.benefits.demoDataOnly",
  "No payouts": "toolsUI.trustEngine.benefits.noPayouts",
  "100 calls / day": "toolsUI.trustEngine.benefits.callsPerDay100",
  "500 calls / day": "toolsUI.trustEngine.benefits.callsPerDay500",
  "5,000 calls / day": "toolsUI.trustEngine.benefits.callsPerDay5k",
  "Manual payouts": "toolsUI.trustEngine.benefits.manualPayouts",
  "Marketplace browse": "toolsUI.trustEngine.benefits.marketplaceBrowse",
  "Auto payouts (weekly)": "toolsUI.trustEngine.benefits.autoPayoutsWeekly",
  "Marketplace bid": "toolsUI.trustEngine.benefits.marketplaceBid",
  "Unlimited routing": "toolsUI.trustEngine.benefits.unlimitedRouting",
  "Daily payouts": "toolsUI.trustEngine.benefits.dailyPayouts",
  "Featured marketplace slot": "toolsUI.trustEngine.benefits.featuredMarketplaceSlot",
  "Priority support": "toolsUI.trustEngine.benefits.prioritySupport",
  "White-glove support": "toolsUI.trustEngine.benefits.whiteGloveSupport",
  "Custom rate cards": "toolsUI.trustEngine.benefits.customRateCards",
  "Direct API quota": "toolsUI.trustEngine.benefits.directApiQuota",
  "Avortyx Verified badge": "toolsUI.trustEngine.benefits.vortyxVerifiedBadge",
};

const TIER_LABEL_KEYS: Record<string, string> = {
  sandbox: "toolsUI.trustEngine.tiers.sandbox",
  bronze: "toolsUI.trustEngine.tiers.bronze",
  silver: "toolsUI.trustEngine.tiers.silver",
  gold: "toolsUI.trustEngine.tiers.gold",
  platinum: "toolsUI.trustEngine.tiers.platinum",
};

export default function KycPage() {
  const { t } = useTranslation();
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
        title={t("toolsUI.trustEngine.pageTitle")}
        description={t("toolsUI.trustEngine.pageDescription")}
      />

      {/* Hero — gauge + tier ladder */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]">
          {/* Gauge column */}
          <div className="flex flex-col items-center justify-center gap-3 border-b border-border bg-secondary/15 p-6 lg:border-b-0 lg:border-r">
            <TrustScoreGauge score={score} tier={tier} next={next} />
            <div className="text-center text-[11px] text-muted-foreground">
              {t("toolsUI.trustEngine.vectorsVerified")
                .replace("{verified}", String(verifiedCount))
                .replace("{total}", String(totalCount))}
            </div>
          </div>

          {/* Tier ladder */}
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold">{t("toolsUI.trustEngine.tierLadder")}</h2>
            </div>
            <ol className="relative space-y-3 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {TIERS.map((tierDef) => {
                const reached = score >= tierDef.minScore;
                const current = tierDef.id === tier.id;
                return (
                  <li
                    key={tierDef.id}
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
                          {tierDef.minScore}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                            tierDef.badgeClass,
                          )}
                        >
                          {t(TIER_LABEL_KEYS[tierDef.id] ?? "")}
                        </span>
                        {current && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                            {t("toolsUI.trustEngine.youAreHere")}
                          </span>
                        )}
                        <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
                          {tierDef.minScore}{t("toolsUI.trustEngine.pointsSuffix")}
                        </span>
                      </div>
                      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {tierDef.benefits.map((b) => {
                          const key = BENEFIT_KEYS[b];
                          const translated = key ? t(key) : b;
                          const label = translated === key ? b : translated;
                          return (
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
                              {label}
                            </li>
                          );
                        })}
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
            <h2 className="text-base font-semibold">{t("toolsUI.trustEngine.vectorsGridTitle")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("toolsUI.trustEngine.vectorsGridDescription")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums text-foreground">
              {score} / 100
            </span>
            <span>{t("toolsUI.trustEngine.ptsLabel")}</span>
          </div>
        </div>
        <VectorGrid />
      </div>

      {/* Why the Trust Engine is different */}
      <Card className="bg-secondary/10 p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("toolsUI.trustEngine.whyTitle")}
        </h3>
        <ul className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          {WHY_KEYS.map((w) => (
            <li key={w.id} className="rounded-md border border-border bg-card p-3">
              <div className="text-foreground font-medium">{t(w.titleKey)}</div>
              <p className="mt-1 leading-relaxed">{t(w.bodyKey)}</p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

const WHY_KEYS = [
  {
    id: "continuous",
    titleKey: "toolsUI.trustEngine.whyCards.continuous.title",
    bodyKey: "toolsUI.trustEngine.whyCards.continuous.body",
  },
  {
    id: "stackable",
    titleKey: "toolsUI.trustEngine.whyCards.stackable.title",
    bodyKey: "toolsUI.trustEngine.whyCards.stackable.body",
  },
  {
    id: "autoApproval",
    titleKey: "toolsUI.trustEngine.whyCards.autoApproval.title",
    bodyKey: "toolsUI.trustEngine.whyCards.autoApproval.body",
  },
];

// Keep TypeScript happy on unused imports if any side-effect type narrows.
void VECTOR_WEIGHTS;
type _VectorRef = KycVectorId;
