"use client";

import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceSection } from "@/components/settings/workspace-section";
import { useTranslation } from "@/hooks/use-translation";

export default function WorkspacePage() {
  const { t } = useTranslation();
  return (
    // Max-width wrapper — matches the Campaign / Shield edit pages.
    <div className="mx-auto w-full max-w-[928px] space-y-6">
      <PageHeader
        title={t("page.workspace.title")}
        description={t("page.workspace.description")}
      />
      <WorkspaceSection />
    </div>
  );
}
