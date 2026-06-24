"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown } from "lucide-react";
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
    // The backend has no `POST /api/accounts/roles` endpoint — custom roles
    // can't actually be created. The previous handler just toasted success
    // and navigated, which silently dropped the user's permission picks.
    // Surface this honestly instead of pretending it worked.
    toast.message("Custom roles aren't shipped yet.", {
      description:
        "The role catalog at GET /api/accounts/roles is read-only. Creating new roles needs a backend POST endpoint we haven't requested yet.",
    });
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
        {/* Honest framing — custom role creation has no backend yet. The
            permission tree below is a preview of the future flow; the Save
            button intentionally shows a "not shipped" message instead of
            silently dropping the user's selection. */}
        <div className="m-5 flex items-start gap-2.5 rounded-md border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--warning)]" />
          <div className="space-y-1">
            <div className="font-semibold text-[color:var(--warning)]">
              Preview — custom roles not yet shipped
            </div>
            <p className="text-muted-foreground">
              The role catalog (admin / manager / agent / buyer / publisher /
              viewer) is fetched from the backend at{" "}
              <span className="font-mono">/api/accounts/roles</span>. Creating a
              new role with custom permissions requires a backend endpoint
              that doesn't exist yet. Use the existing roles in the meantime.
            </p>
          </div>
        </div>

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
