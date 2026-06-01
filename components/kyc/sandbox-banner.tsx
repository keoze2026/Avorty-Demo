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

/**
 * Sandbox banner — appears across every authenticated page while the user
 * is below the Silver tier (the threshold at which payouts unlock).
 * Auto-hides on the /kyc page itself (the banner would be redundant) and
 * once the user dismisses it for the session.
 */
export function SandboxBanner() {
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
            {tier.label} tier
          </span>
          <span className="text-muted-foreground">
            {" "}
            — capped at {cap} calls / day, payouts disabled. Verify to unlock.
          </span>
        </div>
        <Link
          href={ROUTES.kyc}
          className="inline-flex items-center gap-1 rounded-md border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/15 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--warning)] transition-colors hover:bg-[color:var(--warning)]/25"
        >
          Open Trust Engine
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
