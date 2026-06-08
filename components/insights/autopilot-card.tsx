"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Check, Loader2, PlayCircle, ShieldAlert, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { aiService, type AutopilotConfig } from "@/lib/api/services/ai.service";
import { useAiInsightsStore } from "@/lib/store/ai-insights-store";
import type { AutopilotRule } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

/** Translate the backend's flat config into the frontend rule rows. */
function configToRules(c: AutopilotConfig | null): AutopilotRule[] {
  return [
    {
      id: "pauseOnHighNoAnswer",
      label: "Pause on high no-answer rate",
      description: `Auto-pause buyers when 7-day no-answer rate exceeds ${c?.noAnswerThreshold ?? 70}%.`,
      tone: "caution",
      enabled: c?.pauseOnHighNoAnswer ?? false,
    },
    {
      id: "alertOnVolumeDrop",
      label: "Alert on volume drop",
      description: `Notify when daily call volume drops more than ${c?.volumeDropThreshold ?? 50}% vs. trailing average.`,
      tone: "safe",
      enabled: c?.alertOnVolumeDrop ?? false,
    },
    {
      id: "alertOnRevenueDrop",
      label: "Alert on revenue drop",
      description: `Notify when daily revenue drops more than ${c?.revenueDropThreshold ?? 40}% vs. trailing average.`,
      tone: "safe",
      enabled: c?.alertOnRevenueDrop ?? false,
    },
  ];
}

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
  const { t } = useTranslation();
  const [config, setConfig] = useState<AutopilotConfig | null>(null);
  const rules = configToRules(config);
  const enabledCount = rules.filter((r) => r.enabled).length;
  const runAutopilot = useAiInsightsStore((s) => s.runAutopilot);
  const lastActions = useAiInsightsStore((s) => s.autopilotActions);
  const [running, setRunning] = useState(false);

  // Hydrate autopilot config from /api/ai/autopilot/config.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const cfg = await aiService.getAutopilotConfig();
        if (!cancelled) setConfig(cfg);
      } catch {
        // Endpoint may be unavailable in early deployments — leave rules disabled.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRunPass = async () => {
    setRunning(true);
    try {
      const actions = await runAutopilot();
      if (actions.length === 0) {
        toast.success(t("toolsUI.insights.autopilot.title"), {
          description: "No actions taken — everything looks healthy.",
        });
      } else {
        toast.success(t("toolsUI.insights.autopilot.title"), {
          description: `${actions.length} action${actions.length === 1 ? "" : "s"} executed`,
        });
      }
    } catch {
      toast.error("Autopilot pass failed");
    } finally {
      setRunning(false);
    }
  };

  // Persists the toggle to the backend. Maps the rule id to the matching
  // boolean field on AutopilotConfig and PATCHes the whole object.
  const toggle = async (id: string) => {
    if (!config) return;
    const fieldMap: Record<string, keyof AutopilotConfig> = {
      pauseOnHighNoAnswer: "pauseOnHighNoAnswer",
      alertOnVolumeDrop: "alertOnVolumeDrop",
      alertOnRevenueDrop: "alertOnRevenueDrop",
    };
    const field = fieldMap[id];
    if (!field) return;
    const prev = config;
    const next = { ...config, [field]: !config[field] };
    setConfig(next); // optimistic
    try {
      const saved = await aiService.updateAutopilotConfig({ [field]: next[field] } as Partial<AutopilotConfig>);
      setConfig(saved);
      toast.success(
        next[field]
          ? t("toolsUI.insights.autopilot.toastEnabled")
          : t("toolsUI.insights.autopilot.toastDisabled"),
        { description: rules.find((r) => r.id === id)?.label },
      );
    } catch (e) {
      setConfig(prev);
      toast.error(e instanceof Error ? e.message : "Couldn't update autopilot");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Bot className="h-3.5 w-3.5" />
          </span>
          {t("toolsUI.insights.autopilot.title")}
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-medium text-accent">
            <Check className="h-3 w-3" />
            {t("toolsUI.insights.autopilot.active").replace("{count}", String(enabledCount))}
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("toolsUI.insights.autopilot.description")}
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

        {/* Run-now CTA + last-actions log. The backend exposes a POST endpoint
            that executes a pass and returns the actions taken. Pure server-
            side decisioning — the toggle rows above are still local because
            the backend's rules are baked-in, not configurable from here. */}
        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Run autopilot pass</div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {lastActions.length > 0
                ? `Last pass executed ${lastActions.length} action${lastActions.length === 1 ? "" : "s"}.`
                : "Server-side rule engine evaluates current performance and pauses underperformers."}
            </p>
          </div>
          <Button size="sm" onClick={onRunPass} disabled={running} className="shrink-0">
            {running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…
              </>
            ) : (
              <>
                <PlayCircle className="h-3.5 w-3.5" /> Run now
              </>
            )}
          </Button>
        </div>

        {lastActions.length > 0 && (
          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
            {lastActions.slice(0, 5).map((a, i) => (
              <li key={`${a.entity}:${i}`} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--success)]" />
                <span>
                  <span className="font-medium text-foreground">{a.action}</span>{" "}
                  <span className="font-mono">{a.entity}</span>
                  {a.reason && <span> — {a.reason}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
