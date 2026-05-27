"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { useCampaignSettingsStore } from "@/lib/store/campaign-settings-store";
import type { AccessGrant } from "@/lib/types";

function makeId() {
  return `ac_${Math.random().toString(36).slice(2, 8)}`;
}

const ROLE_VARIANT: Record<AccessGrant["role"], React.ComponentProps<typeof Badge>["variant"]> = {
  owner: "success",
  editor: "default",
  viewer: "outline",
};

export function AccessTab({ campaignId }: { campaignId: string }) {
  const get = useCampaignSettingsStore((s) => s.get);
  const update = useCampaignSettingsStore((s) => s.update);
  const grants = get(campaignId).access;

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AccessGrant["role"]>("viewer");

  const addGrant = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    update(campaignId, "access", [
      ...grants,
      { id: makeId(), email: email.trim(), role, grantedAt: Date.now() },
    ]);
    setEmail("");
    setRole("viewer");
    toast.success(`Granted ${role} access to ${email.trim()}`);
  };

  const removeGrant = (id: string) => {
    update(
      campaignId,
      "access",
      grants.filter((g) => g.id !== id),
    );
    toast.success("Access removed");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign Access</CardTitle>
          <p className="text-xs text-muted-foreground">
            Invite teammates to this campaign. Owners can grant access; editors can
            change settings; viewers can read reports only.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
            <div className="grid gap-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AccessGrant["role"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addGrant}>
                <Plus className="h-4 w-4" /> Grant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {grants.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-6 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            Members ({grants.length})
          </div>
          <ul className="divide-y divide-border">
            {grants.map((g) => (
              <li key={g.id} className="flex items-center gap-4 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{g.email}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Granted {new Date(g.grantedAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={ROLE_VARIANT[g.role]} className="capitalize">
                  {g.role}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => removeGrant(g.id)}
                  aria-label={`Remove ${g.email}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
