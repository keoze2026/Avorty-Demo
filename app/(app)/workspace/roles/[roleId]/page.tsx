"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SetupRoleForm } from "@/components/workspace/setup-role-form";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";

/** "manager-restricted" → "Manager Restricted" */
function formatRoleName(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export default function SetupRolePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = use(params);
  const { t } = useTranslation();
  // Built-in slugs (admin/manager/buyer/publisher/viewer) get localized role
  // names via the workspaceUI dictionary; freeform slugs fall back to a
  // prettified version of the URL segment.
  const localizedRole = t(`workspaceUI.members.role.${roleId}`);
  const isLocalized = localizedRole !== `workspaceUI.members.role.${roleId}`;
  const roleName = isLocalized ? localizedRole : formatRoleName(roleId);

  return (
    <>
      <Link
        href={ROUTES.workspace}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("workspaceUI.setupRole.backLink")}
      </Link>

      <PageHeader title={roleName} description={t("workspaceUI.setupRole.pageDescription")} />

      <SetupRoleForm roleId={roleId} />
    </>
  );
}
