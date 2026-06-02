"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import {
  selectTier,
  selectTrustScore,
  useKycStore,
} from "@/lib/store/kyc-store";
import { useTranslation } from "@/hooks/use-translation";

const TIER_LABEL_KEYS: Record<string, string> = {
  sandbox: "toolsUI.trustEngine.tiers.sandbox",
  bronze: "toolsUI.trustEngine.tiers.bronze",
  silver: "toolsUI.trustEngine.tiers.silver",
  gold: "toolsUI.trustEngine.tiers.gold",
  platinum: "toolsUI.trustEngine.tiers.platinum",
};

/**
 * Sandbox banner — appears across every authenticated page while the user
 * is below the Silver tier (the threshold at which payouts unlock).
 * Auto-hides on the /kyc page itself (the banner would be redundant) and
 * once the user dismisses it for the session.
 */
export function SandboxBanner() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const score = useKycStore((s) => selectTrustScore(s));
  const tier = selectTier(score);
  const bannerDismissed = useKycStore((s) => s.bannerDismissed);
  const dismiss = useKycStore((s) => s.dismissBanner);

  // Don't render on the KYC page itself, once dismissed, or once silver+
  if (pathname.startsWith(ROUTES.kyc)) return null;
  if (bannerDismissed) return null;
  if (tier.id !== "sandbox" && tier.id !== "bronze") return null;

  const cap = tier.id === "sandbox" ? 100 : 500;

  return (
    <div className="border-b border-[color:var(--warning)]/30 bg-[color:var(--warning)]/8">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        <ShieldAlert className="h-4 w-4 shrink-0 text-[color:var(--warning)]" />
        <div className="min-w-0 flex-1 text-[12px]">
          <span className="font-semibold text-foreground">
            {t("toolsUI.trustEngine.banner.tierLabel").replace("{tier}", t(TIER_LABEL_KEYS[tier.id] ?? ""))}
          </span>
          <span className="text-muted-foreground">
            {t("toolsUI.trustEngine.banner.bannerBody").replace("{cap}", String(cap))}
          </span>
        </div>
        <Link
          href={ROUTES.kyc}
          className="inline-flex items-center gap-1 rounded-md border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/15 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--warning)] transition-colors hover:bg-[color:var(--warning)]/25"
        >
          {t("toolsUI.trustEngine.banner.openTrustEngine")}
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("toolsUI.trustEngine.banner.dismissAria")}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
