import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SetupRoleForm } from "@/components/workspace/setup-role-form";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/lib/constants";

/** "manager-restricted" → "Manager Restricted" */
function formatRoleName(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export default async function SetupRolePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  const roleName = formatRoleName(roleId);

  return (
    <>
      <Link
        href={ROUTES.workspace}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Workspace Settings
      </Link>

      <PageHeader title={roleName} description="Manage permissions for this role" />

      <SetupRoleForm roleId={roleId} />
    </>
  );
}
