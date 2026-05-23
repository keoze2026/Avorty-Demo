import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Look up against the static fixtures for SSR-time title resolution.
  // (Locally-created campaigns live in the client store; they'll inherit the default title.)
  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id);
  return { title: campaign?.name ?? "Campaign" };
}

export default function CampaignDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
