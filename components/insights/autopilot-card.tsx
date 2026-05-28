"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, ShieldAlert, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MOCK_AUTOPILOT_RULES } from "@/lib/mock/insights";
import type { AutopilotRule } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE: Record<AutopilotRule["tone"], { icon: LucideIcon; chip: string; iconBg: string }> = {
  safe: {
    icon: ShieldCheck,
    chip: "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]",
    iconBg: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  },
  caution: {
    icon: ShieldAlert,
    chip: "border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
    iconBg: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  },
  aggressive: {
    icon: Sparkles,
    chip: "border-destructive/30 bg-destructive/10 text-destructive",
    iconBg: "bg-destructive/15 text-destructive",
  },
};

export function AutopilotCard() {
  const [rules, setRules] = useState<AutopilotRule[]>(MOCK_AUTOPILOT_RULES);
  const enabledCount = rules.filter((r) => r.enabled).length;

  const toggle = (id: string) => {
    setRules((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, enabled: !r.enabled };
        toast.success(next.enabled ? `Autopilot rule enabled` : `Autopilot rule disabled`, {
          description: next.label,
        });
        return next;
      }),
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Bot className="h-3.5 w-3.5" />
          </span>
          Autopilot
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-medium text-accent">
            <Check className="h-3 w-3" />
            {enabledCount} active
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Let the co-pilot act on its own for things you trust. Off by default.
        </p>
      </CardHeader>

      <CardContent className="space-y-1">
        {rules.map((r, i) => {
          const t = TONE[r.tone];
          const Icon = t.icon;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.22 }}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5 transition-colors hover:bg-secondary/20"
            >
              <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md", t.iconBg)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.label}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", t.chip)}>
                    {r.tone}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
              </div>
              <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
