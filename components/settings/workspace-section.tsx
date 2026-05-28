"use client";

import { useState } from "react";
import { Building2, Clock, Globe2, Palette } from "lucide-react";
import { toast } from "sonner";

import { SectionShell } from "./profile-section";
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
import { cn } from "@/lib/utils";

const ACCENT_OPTIONS = [
  { id: "indigo", label: "Indigo · default", color: "linear-gradient(135deg, #5266E0, #3A4BC4)" },
  { id: "teal", label: "Teal", color: "linear-gradient(135deg, #00e6b8, #22d3ee)" },
  { id: "violet", label: "Violet", color: "linear-gradient(135deg, #a855f7, #6366f1)" },
  { id: "amber", label: "Amber", color: "linear-gradient(135deg, #f59e0b, #f97316)" },
  { id: "rose", label: "Rose", color: "linear-gradient(135deg, #f43f5e, #ec4899)" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
];

export function WorkspaceSection() {
  const [name, setName] = useState("Vortyx Demo Co.");
  const [slug, setSlug] = useState("vortyx-demo");
  const [tz, setTz] = useState("America/Los_Angeles");
  const [accent, setAccent] = useState("teal");

  return (
    <SectionShell
      eyebrow="Workspace"
      title="Workspace defaults"
      description="Settings that apply to your entire organization."
    >
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
              <Label htmlFor="ws-slug" className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3 w-3 text-muted-foreground" />
                URL slug
              </Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-border bg-secondary/40 px-3 text-xs font-mono text-muted-foreground">
                  vortyx.io /
                </span>
                <Input
                  id="ws-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="rounded-l-none font-mono"
                />
              </div>
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
                <SelectContent>
                  {TIMEZONES.map((z) => (
                    <SelectItem key={z} value={z}>
                      {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accent picker */}
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-1.5">
              <Palette className="h-3 w-3 text-muted-foreground" />
              Brand accent
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ACCENT_OPTIONS.map((opt) => {
                const active = opt.id === accent;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setAccent(opt.id)}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg border p-3 text-left transition-all",
                      active
                        ? "border-accent/50 bg-accent/5 shadow-sm"
                        : "border-border bg-secondary/30 hover:border-accent/30",
                    )}
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-md shadow-sm"
                      style={{ background: opt.color }}
                    />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              The accent flows everywhere — buttons, charts, hover states, even your branded reports.
            </p>
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
              <div className="text-xs text-muted-foreground">Hand the workspace off to another admin.</div>
            </div>
            <Button variant="outline">Transfer</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div>
              <div className="text-sm font-medium">Delete workspace</div>
              <div className="text-xs text-muted-foreground">Permanently remove all data — no undo.</div>
            </div>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}
