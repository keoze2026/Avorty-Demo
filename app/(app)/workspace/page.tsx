"use client";

import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceSection } from "@/components/settings/workspace-section";

export default function WorkspacePage() {
  return (
    // Max-width wrapper — matches the Campaign / Shield edit pages.
    <div className="mx-auto w-full max-w-[928px] space-y-6">
      <PageHeader
        title="Workspace"
        description="Org defaults, members, and roles that apply to your entire organization."
      />
      <WorkspaceSection />
    </div>
  );
}
