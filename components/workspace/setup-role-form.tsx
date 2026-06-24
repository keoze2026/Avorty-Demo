"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { friendlyErrorMessage } from "@/lib/api/errors";
import { workspaceService } from "@/lib/api/services/workspace.service";
import { ROUTES } from "@/lib/constants";
import {
  PERMISSION_GROUPS,
  type PermissionState,
  seedForRole,
} from "@/lib/workspace-permissions";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface SetupRoleFormProps {
  /** URL parameter — used to seed the permission tree from the matching
   *  built-in role's defaults (admin, manager, etc.). Custom roles created
   *  here always land as new rows; we don't try to inline-edit existing
   *  ones from this form yet. */
  roleId: string;
}

/** Flatten the nested `{groupId: {permId: bool}}` state into the dotted
 *  capability strings the backend stores (e.g. "reporting.view"). */
function stateToCapabilities(state: PermissionState): string[] {
  const caps: string[] = [];
  for (const g of PERMISSION_GROUPS) {
    const groupState = state[g.id] ?? {};
    for (const p of g.permissions) {
      if (groupState[p.id]) caps.push(`${g.id}.${p.id}`);
    }
  }
  return caps;
}

export function SetupRoleForm({ roleId }: SetupRoleFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, setState] = React.useState<PermissionState>(() => seedForRole(roleId));
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

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

  const onSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Give the role a name first.");
      return;
    }
    const capabilities = stateToCapabilities(state);
    if (capabilities.length === 0) {
      toast.error("Pick at least one capability.");
      return;
    }
    setSaving(true);
    try {
      await workspaceService.createWorkspaceRole({
        name: trimmedName,
        description: description.trim(),
        capabilities,
      });
      toast.success(`Role "${trimmedName}" created`);
      router.push(ROUTES.workspace);
    } catch (e) {
      toast.error(friendlyErrorMessage(e, "Couldn't create role"));
    } finally {
      setSaving(false);
    }
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
        {/* Identity inputs — required by the backend POST. The permission
            tree below seeds from whichever built-in role's defaults match
            the URL param so the user starts with a sensible baseline. */}
        <div className="grid gap-4 border-b border-border px-5 py-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="role-name" className="text-xs">
              Role name
            </Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Compliance Reviewer"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-desc" className="text-xs">
              Description
            </Label>
            <Input
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One line — what's this role for?"
            />
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
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.workspace)}
            disabled={saving}
          >
            {t("workspaceUI.setupRole.cancel")}
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
              </>
            ) : (
              t("workspaceUI.setupRole.save")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

