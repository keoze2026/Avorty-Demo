"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlockedCarriersCard } from "@/components/suppression/blocked-carriers-card";
import { ProtectedCampaignsCard } from "@/components/suppression/protected-campaigns-card";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/lib/constants";
import { useVoipShieldStore } from "@/lib/store/voip-shield-store";

export default function VoipShieldDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const shield = useVoipShieldStore((s) => s.shields.find((x) => x.id === id));
  const addCampaign = useVoipShieldStore((s) => s.addCampaign);
  const removeCampaign = useVoipShieldStore((s) => s.removeCampaign);
  const addCarrier = useVoipShieldStore((s) => s.addCarrier);
  const removeCarrier = useVoipShieldStore((s) => s.removeCarrier);

  if (!shield) {
    return (
      <>
        <Link
          href={ROUTES.voipShield}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          VoIP Shield
        </Link>
        <PageHeader
          title="Shield not found"
          description="This shield no longer exists. Return to the list to pick another."
        />
        <button
          type="button"
          onClick={() => router.push(ROUTES.voipShield)}
          className="text-xs text-accent hover:underline"
        >
          Back to VoIP Shield
        </button>
      </>
    );
  }

  return (
    // Max-width wrapper — keeps the shield edit form readable without
    // stretching across the whole content area (matches Campaign edit).
    <div className="mx-auto w-full max-w-[928px] space-y-6">
      <Link
        href={ROUTES.voipShield}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        VoIP Shield
      </Link>

      <PageHeader
        title={shield.name}
        description="Block VoIP callers to prevent fraud traffic, $0.01 per call"
      />

      <ProtectedCampaignsCard
        selectedIds={shield.campaignIds}
        onAdd={(campaignId) => addCampaign(shield.id, campaignId)}
        onRemove={(campaignId) => removeCampaign(shield.id, campaignId)}
      />

      <BlockedCarriersCard
        carriers={shield.blockedCarriers}
        onBlock={(carrier) => addCarrier(shield.id, carrier)}
        onUnblock={(carrier) => removeCarrier(shield.id, carrier)}
      />
    </div>
  );
}
