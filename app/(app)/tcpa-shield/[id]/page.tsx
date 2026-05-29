"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProtectedCampaignsCard } from "@/components/suppression/protected-campaigns-card";
import { ProviderConfigurationCard } from "@/components/suppression/provider-configuration-card";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/lib/constants";
import { useTcpaShieldStore } from "@/lib/store/tcpa-shield-store";

export default function TcpaShieldDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const provider = useTcpaShieldStore((s) => s.providers.find((x) => x.id === id));
  const addCampaign = useTcpaShieldStore((s) => s.addCampaign);
  const removeCampaign = useTcpaShieldStore((s) => s.removeCampaign);
  const updateConfig = useTcpaShieldStore((s) => s.updateConfig);

  if (!provider) {
    return (
      <>
        <Link
          href={ROUTES.tcpaShield}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          TCPA Shield
        </Link>
        <PageHeader
          title="Provider not found"
          description="This provider no longer exists. Return to the list to pick another."
        />
        <button
          type="button"
          onClick={() => router.push(ROUTES.tcpaShield)}
          className="text-xs text-accent hover:underline"
        >
          Back to TCPA Shield
        </button>
      </>
    );
  }

  return (
    // Max-width wrapper — keeps the provider edit form readable without
    // stretching across the whole content area (matches Campaign edit).
    <div className="mx-auto w-full max-w-[928px] space-y-6">
      <Link
        href={ROUTES.tcpaShield}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        TCPA Shield
      </Link>

      <PageHeader
        title={provider.name}
        description="Check callers against DNC providers to block unwanted or risky calls before routing"
      />

      <ProtectedCampaignsCard
        selectedIds={provider.campaignIds}
        onAdd={(campaignId) => addCampaign(provider.id, campaignId)}
        onRemove={(campaignId) => removeCampaign(provider.id, campaignId)}
        description="Add campaigns to check callers against DNC providers before routing."
      />

      <ProviderConfigurationCard
        config={provider.config}
        onChange={(patch) => updateConfig(provider.id, patch)}
      />
    </div>
  );
}
