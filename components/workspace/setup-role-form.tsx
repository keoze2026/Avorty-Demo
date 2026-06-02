"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import {
  PERMISSION_GROUPS,
  type PermissionState,
  seedForRole,
} from "@/lib/workspace-permissions";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface SetupRoleFormProps {
  /** Used only to seed the form with sensible defaults per built-in role. */
  roleId: string;
}

export function SetupRoleForm({ roleId }: SetupRoleFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, setState] = React.useState<PermissionState>(() => seedForRole(roleId));

  // Determine if every permission across every group is enabled.
  const allEnabled = React.useMemo(
    () =>
      PERMISSION_GROUPS.every((g) =>
        g.permissions.every((p) => state[g.id]?.[p.id]),
      ),
    [state],
  );

  const setAll = (on: boolean) => {
    const next: PermissionState = {};
    for (const g of PERMISSION_GROUPS) {
      next[g.id] = {};
      for (const p of g.permissions) next[g.id][p.id] = on;
    }
    setState(next);
  };

  const setGroup = (groupId: string, on: boolean) => {
    setState((prev) => {
      const group = PERMISSION_GROUPS.find((g) => g.id === groupId);
      if (!group) return prev;
      const next = { ...prev, [groupId]: { ...(prev[groupId] ?? {}) } };
      for (const p of group.permissions) next[groupId][p.id] = on;
      return next;
    });
  };

  const setPermission = (groupId: string, permId: string, on: boolean) => {
    setState((prev) => ({
      ...prev,
      [groupId]: { ...(prev[groupId] ?? {}), [permId]: on },
    }));
  };

  const onSave = () => {
    toast.success(t("workspaceUI.setupRole.saved"));
    router.push(ROUTES.workspace);
  };

  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border bg-secondary/20 px-5 py-4 space-y-0">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("workspaceUI.setupRole.eyebrow")}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("workspaceUI.setupRole.caption")}</p>
        </div>
        <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary/50">
          <Checkbox checked={allEnabled} onCheckedChange={(v) => setAll(Boolean(v))} />
          {t("workspaceUI.setupRole.enableAll")}
        </Label>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {PERMISSION_GROUPS.map((group) => {
            const groupState = state[group.id] ?? {};
            const enabledCount = group.permissions.filter((p) => groupState[p.id]).length;
            const totalCount = group.permissions.length;
            const allOn = enabledCount === totalCount;
            const someOn = enabledCount > 0 && enabledCount < totalCount;

            const groupLabel = t(`workspaceUI.setupRole.groups.${group.id}`);
            return (
              <Collapsible
                key={group.id}
                defaultOpen={allOn || someOn}
                className="group/perm"
              >
                <div className="flex items-center justify-between px-5 py-3">
                  <Label className="inline-flex flex-1 cursor-pointer items-center gap-2.5 text-sm font-medium">
                    <Checkbox
                      checked={allOn ? true : someOn ? "indeterminate" : false}
                      onCheckedChange={(v) => setGroup(group.id, Boolean(v))}
                    />
                    {groupLabel}
                  </Label>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      aria-label={t("workspaceUI.setupRole.toggleGroup").replace("{group}", groupLabel)}
                    >
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/perm:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="flex flex-wrap gap-2 px-5 pb-4">
                    {group.permissions.map((p) => {
                      const checked = !!groupState[p.id];
                      const inputId = `${group.id}-${p.id}`;
                      return (
                        <Label
                          key={p.id}
                          htmlFor={inputId}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                            checked
                              ? "border-accent/45 bg-accent/12 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary/40",
                          )}
                        >
                          <Checkbox
                            id={inputId}
                            checked={checked}
                            onCheckedChange={(v) => setPermission(group.id, p.id, Boolean(v))}
                          />
                          {t(`workspaceUI.setupRole.permissions.${p.id}`)}
                        </Label>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-secondary/10 px-5 py-3">
          <Button variant="outline" onClick={() => router.push(ROUTES.workspace)}>
            {t("workspaceUI.setupRole.cancel")}
          </Button>
          <Button onClick={onSave}>{t("workspaceUI.setupRole.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
