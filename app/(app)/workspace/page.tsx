"use client";

import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceSection } from "@/components/settings/workspace-section";

export default function WorkspacePage() {
  return (
    <>
      <PageHeader
        title="Workspace"
        description="Org defaults, members, and roles that apply to your entire organization."
      />
      <WorkspaceSection />
    </>
  );
}
