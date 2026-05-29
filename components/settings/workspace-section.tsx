"use client";

import * as React from "react";
import {
  Activity,
  Building2,
  Clock,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { WorkspaceActivityLog } from "./workspace-activity-log";
import {
  MOCK_MEMBERS,
  WorkspaceMembersTable,
} from "./workspace-members-table";
import { WorkspaceRolesTable } from "./workspace-roles-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Member } from "@/lib/types";
import { TIMEZONES } from "@/lib/timezones";
import { cn } from "@/lib/utils";

type TabId = "general" | "members" | "roles" | "activity";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "members", label: "Members", icon: Users },
  { id: "roles", label: "Roles", icon: ShieldCheck },
  { id: "activity", label: "Activity", icon: Activity },
];

export function WorkspaceSection() {
  const [name, setName] = React.useState("Vortyx Demo Co.");
  const [tz, setTz] = React.useState("America/Los_Angeles");
  const [members, setMembers] = React.useState<Member[]>(MOCK_MEMBERS);
  const [tab, setTab] = React.useState<TabId>("general");

  return (
    <div className="space-y-4">
      {/* Underline-style tab strip — matches the Campaign Settings + Call Summary tabs. */}
      <div className="flex overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
                active
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-0.5 bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── General: Identity + Danger zone ─── */}
      {tab === "general" && (
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ws-name" className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    Display name
                  </Label>
                  <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    Default timezone
                  </Label>
                  <Select value={tz} onValueChange={setTz}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {TIMEZONES.map((z) => (
                        <SelectItem key={z.iana} value={z.iana}>
                          {z.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => toast.success("Workspace settings saved")}>Save</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
              <p className="text-xs text-muted-foreground">Operations here are irreversible.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div>
                  <div className="text-sm font-medium">Transfer ownership</div>
                  <div className="text-xs text-muted-foreground">
                    Hand the workspace off to another admin.
                  </div>
                </div>
                <Button variant="outline">Transfer</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div>
                  <div className="text-sm font-medium">Delete workspace</div>
                  <div className="text-xs text-muted-foreground">
                    Permanently remove all data — no undo.
                  </div>
                </div>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "members" && (
        <WorkspaceMembersTable members={members} onMembersChange={setMembers} />
      )}

      {tab === "roles" && <WorkspaceRolesTable members={members} />}

      {tab === "activity" && <WorkspaceActivityLog />}
    </div>
  );
}
