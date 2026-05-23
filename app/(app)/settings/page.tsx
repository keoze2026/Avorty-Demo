import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Workspace, team & permissions, API keys, and personal preferences."
      />
      <EmptyState
        icon={Settings}
        tone="amber"
        title="Settings module arrives in Phase 8"
        description="Account & workspace, team & RBAC permission matrix, API keys, and notification preferences."
      />
    </>
  );
}
