"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLES_IN_ORDER } from "@/lib/mock/settings";
import { ROUTES } from "@/lib/constants";
import {
  countEnabledPermissions,
  seedForRole,
  TOTAL_PERMISSIONS,
} from "@/lib/workspace-permissions";
import type { Member, MemberRole } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

interface WorkspaceRolesTableProps {
  members: Member[];
}

export function WorkspaceRolesTable({ members }: WorkspaceRolesTableProps) {
  const router = useRouter();
  const { t } = useTranslation();

  // Count active members per role so the table tells the operator who has what.
  const memberCounts = useMemo<Record<MemberRole, number>>(() => {
    const counts: Record<MemberRole, number> = {
      admin: 0,
      manager: 0,
      buyer: 0,
      publisher: 0,
      viewer: 0,
    };
    for (const m of members) {
      if (m.status === "active" || m.status === "invited") counts[m.role] += 1;
    }
    return counts;
  }, [members]);

  // Permission count per role derived from the same seed the Setup Role form uses.
  const permissionCounts = useMemo<Record<MemberRole, number>>(() => {
    const counts: Record<MemberRole, number> = {
      admin: 0,
      manager: 0,
      buyer: 0,
      publisher: 0,
      viewer: 0,
    };
    for (const role of ROLES_IN_ORDER) {
      counts[role] = countEnabledPermissions(seedForRole(role));
    }
    return counts;
  }, []);

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border bg-secondary/20 px-4 py-3 space-y-0">
        <div>
          <CardTitle className="text-base">{t("workspaceUI.roles.title")}</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("workspaceUI.roles.description")}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 text-left">{t("workspaceUI.roles.columnRole")}</TableHead>
                <TableHead className="text-left">{t("workspaceUI.roles.columnDescription")}</TableHead>
                <TableHead>{t("workspaceUI.roles.columnMembers")}</TableHead>
                <TableHead>{t("workspaceUI.roles.columnPermissions")}</TableHead>
                <TableHead className="pr-4">{t("workspaceUI.roles.columnActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROLES_IN_ORDER.map((role) => (
                <TableRow key={role}>
                  <TableCell className="pl-4 text-left">
                    <div className="inline-flex items-center gap-2 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      {t(`workspaceUI.members.role.${role}`)}
                    </div>
                  </TableCell>
                  <TableCell className="text-left text-[12px] text-muted-foreground">
                    {t(`workspaceUI.roles.descriptions.${role}`)}
                  </TableCell>
                  <TableCell className="tabular-nums">{memberCounts[role]}</TableCell>
                  <TableCell className="tabular-nums">
                    {permissionCounts[role]} / {TOTAL_PERMISSIONS}
                  </TableCell>
                  <TableCell className="pr-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => router.push(`${ROUTES.workspace}/roles/${role}`)}
                    >
                      {t("workspaceUI.roles.edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
