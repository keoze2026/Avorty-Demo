"use client";

/**
 * Vortyx Trust Engine — multi-vector continuous KYC.
 *
 * Rather than the standard "upload an ID and wait" model, we track FIVE
 * independent verification vectors. Each contributes points to a 0-100 trust
 * score, which gates features through five tiers (Sandbox → Platinum).
 * The reputation vector accrues over time from real traffic — it can't be
 * "finished" via a one-shot upload, so KYC becomes a living signal instead
 * of a one-time gate.
 *
 *   Identity         — face scan + government ID match            (20 pts)
 *   Business         — EIN lookup + entity registration           (20 pts)
 *   Banking          — account verification via micro-deposits    (15 pts)
 *   Compliance       — TCPA + DNC + sample-call audit             (25 pts)
 *   Reputation       — accrued from real traffic quality          (20 pts)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type KycVectorId =
  | "identity"
  | "business"
  | "banking"
  | "compliance"
  | "reputation";

export type KycVectorStatus =
  | "locked" // hasn't started
  | "in-progress" // user has started but not completed
  | "review" // submitted, awaiting auto-approval (mock simulates ~3s delay)
  | "verified" // points unlocked
  | "expired"; // re-verification needed (e.g. expired ID)

export interface KycVector {
  id: KycVectorId;
  status: KycVectorStatus;
  /** 0–1 progress within this vector — surfaced for in-progress states. */
  progress: number;
  /** When this vector was last verified (ms). Used for re-verification. */
  verifiedAt?: number;
}

export type KycTier = "sandbox" | "bronze" | "silver" | "gold" | "platinum";

export interface KycTierDefinition {
  id: KycTier;
  label: string;
  /** Min trust score required to reach this tier. */
  minScore: number;
  /** Short, scannable benefit list shown next to the tier on the dashboard. */
  benefits: string[];
  /** Tailwind class for the tier badge tint. */
  badgeClass: string;
}

export const TIERS: KycTierDefinition[] = [
  {
    id: "sandbox",
    label: "Sandbox",
    minScore: 0,
    benefits: ["Demo data only", "No payouts", "100 calls / day"],
    badgeClass: "bg-secondary text-muted-foreground border border-border",
  },
  {
    id: "bronze",
    label: "Bronze",
    minScore: 25,
    benefits: ["500 calls / day", "Manual payouts", "Marketplace browse"],
    badgeClass:
      "bg-[oklch(0.58_0.08_55)]/15 text-[oklch(0.78_0.10_55)] border border-[oklch(0.78_0.10_55)]/30",
  },
  {
    id: "silver",
    label: "Silver",
    minScore: 50,
    benefits: ["5,000 calls / day", "Auto payouts (weekly)", "Marketplace bid"],
    badgeClass:
      "bg-[oklch(0.78_0.04_240)]/15 text-[oklch(0.82_0.04_240)] border border-[oklch(0.82_0.04_240)]/30",
  },
  {
    id: "gold",
    label: "Gold",
    minScore: 75,
    benefits: [
      "Unlimited routing",
      "Daily payouts",
      "Featured marketplace slot",
      "Priority support",
    ],
    badgeClass:
      "bg-[oklch(0.78_0.16_85)]/15 text-[oklch(0.85_0.16_85)] border border-[oklch(0.85_0.16_85)]/30",
  },
  {
    id: "platinum",
    label: "Platinum",
    minScore: 90,
    benefits: [
      "White-glove support",
      "Custom rate cards",
      "Direct API quota",
      "Vortyx Verified badge",
    ],
    badgeClass:
      "bg-[oklch(0.78_0.18_300)]/15 text-[oklch(0.82_0.18_300)] border border-[oklch(0.82_0.18_300)]/30",
  },
];

/** Point weights per vector — total 100. */
export const VECTOR_WEIGHTS: Record<KycVectorId, number> = {
  identity: 20,
  business: 20,
  banking: 15,
  compliance: 25,
  reputation: 20,
};

interface KycState {
  vectors: Record<KycVectorId, KycVector>;
  /** Has the operator dismissed the sandbox banner? */
  bannerDismissed: boolean;

  /** Bump a vector along a multi-step flow. */
  setProgress: (id: KycVectorId, progress: number) => void;
  /** Mark a vector submitted; the demo flips it to verified after ~3s. */
  submit: (id: KycVectorId) => void;
  /** Mark a vector verified immediately (used after `submit` settles). */
  verify: (id: KycVectorId) => void;
  /** Wipe a vector — used by the "Re-verify" affordance. */
  reset: (id: KycVectorId) => void;
  /** Persist the dismissal so the banner only shows once. */
  dismissBanner: () => void;
}

const seed: Record<KycVectorId, KycVector> = {
  identity: { id: "identity", status: "locked", progress: 0 },
  business: { id: "business", status: "locked", progress: 0 },
  banking: { id: "banking", status: "locked", progress: 0 },
  compliance: { id: "compliance", status: "locked", progress: 0 },
  // Reputation can't be locked — it accrues from real traffic. The demo
  // seeds it at 0.42 so new users see they already have *some* baseline.
  reputation: { id: "reputation", status: "in-progress", progress: 0.42 },
};

export const useKycStore = create<KycState>()(
  persist(
    (set) => ({
      vectors: seed,
      bannerDismissed: false,

      setProgress: (id, progress) =>
        set((s) => ({
          vectors: {
            ...s.vectors,
            [id]: {
              ...s.vectors[id],
              progress,
              status: progress > 0 ? "in-progress" : s.vectors[id].status,
            },
          },
        })),

      submit: (id) =>
        set((s) => ({
          vectors: {
            ...s.vectors,
            [id]: { ...s.vectors[id], status: "review", progress: 1 },
          },
        })),

      verify: (id) =>
        set((s) => ({
          vectors: {
            ...s.vectors,
            [id]: {
              ...s.vectors[id],
              status: "verified",
              progress: 1,
              verifiedAt: Date.now(),
            },
          },
        })),

      reset: (id) =>
        set((s) => ({
          vectors: {
            ...s.vectors,
            [id]: { id, status: "locked", progress: 0 },
          },
        })),

      dismissBanner: () => set({ bannerDismissed: true }),
    }),
    {
      name: "vortyx-kyc",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

/* ─── Selectors ────────────────────────────────────────────────────── */

/** Compute the trust score across all vectors. */
export function selectTrustScore(s: KycState): number {
  let score = 0;
  for (const id of Object.keys(VECTOR_WEIGHTS) as KycVectorId[]) {
    const v = s.vectors[id];
    const weight = VECTOR_WEIGHTS[id];
    if (v.status === "verified") score += weight;
    else if (v.status === "in-progress" || v.status === "review") {
      // Partial credit while in-progress (encourages completion).
      score += weight * Math.min(1, v.progress) * 0.5;
    }
  }
  return Math.round(score);
}

/** Resolve a trust score back to the current tier definition. */
export function selectTier(score: number): KycTierDefinition {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (score >= t.minScore) current = t;
  }
  return current;
}

/** Resolve the next tier above the current score (or null at platinum). */
export function selectNextTier(score: number): KycTierDefinition | null {
  for (const t of TIERS) {
    if (score < t.minScore) return t;
  }
  return null;
}
