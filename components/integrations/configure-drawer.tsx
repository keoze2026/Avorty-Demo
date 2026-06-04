"use client";

/**
 * Slide-out configuration drawer for a connected integration.
 *
 * Four tabs:
 *  - Connection — API token, base URL, test-connection
 *  - Events     — which Avortyx events to sync, with descriptions
 *  - Permissions — read/write scopes for the integration
 *  - Activity   — recent sync entries
 *
 * Footer carries a destructive Disconnect alongside Save.
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  Plug2,
  RefreshCw,
  ShieldCheck,
  Webhook as WebhookIcon,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { AppLogo } from "./app-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/format";
import type { IntegrationApp } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface Props {
  app: IntegrationApp | null;
  onOpenChange: (open: boolean) => void;
  onDisconnect: (id: string) => void;
}

interface EventDef {
  key: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const EVENTS: Array<EventDef & { descriptionKey: string }> = [
  { key: "call.completed", label: "call.completed", description: "", descriptionKey: "toolsUI.integrations.configure.eventDefs.completed", defaultOn: true },
  { key: "call.qualified", label: "call.qualified", description: "", descriptionKey: "toolsUI.integrations.configure.eventDefs.qualified", defaultOn: true },
  { key: "call.rejected", label: "call.rejected", description: "", descriptionKey: "toolsUI.integrations.configure.eventDefs.rejected", defaultOn: false },
  { key: "buyer.capped", label: "buyer.capped", description: "", descriptionKey: "toolsUI.integrations.configure.eventDefs.capped", defaultOn: false },
  { key: "publisher.spike", label: "publisher.spike", description: "", descriptionKey: "toolsUI.integrations.configure.eventDefs.spike", defaultOn: false },
  { key: "bid.placed", label: "bid.placed", description: "", descriptionKey: "toolsUI.integrations.configure.eventDefs.bidPlaced", defaultOn: false },
];

interface ScopeDef {
  key: string;
  label: string;
  description: string;
  defaultOn: boolean;
  required?: boolean;
}

const SCOPES: Array<ScopeDef & { labelKey: string; descriptionKey: string }> = [
  { key: "calls.read", label: "Read calls", labelKey: "toolsUI.integrations.configure.scopeDefs.callsRead", description: "Read call records and detail.", descriptionKey: "toolsUI.integrations.configure.scopeDefs.callsReadHint", defaultOn: true, required: true },
  { key: "campaigns.read", label: "Read campaigns", labelKey: "toolsUI.integrations.configure.scopeDefs.campaignsRead", description: "", descriptionKey: "toolsUI.integrations.configure.scopeDefs.campaignsReadHint", defaultOn: true },
  { key: "campaigns.write", label: "Write campaigns", labelKey: "toolsUI.integrations.configure.scopeDefs.campaignsWrite", description: "", descriptionKey: "toolsUI.integrations.configure.scopeDefs.campaignsWriteHint", defaultOn: false },
  { key: "buyers.read", label: "Read buyers", labelKey: "toolsUI.integrations.configure.scopeDefs.buyersRead", description: "", descriptionKey: "toolsUI.integrations.configure.scopeDefs.buyersReadHint", defaultOn: true },
  { key: "buyers.write", label: "Write buyers", labelKey: "toolsUI.integrations.configure.scopeDefs.buyersWrite", description: "", descriptionKey: "toolsUI.integrations.configure.scopeDefs.buyersWriteHint", defaultOn: false },
  { key: "members.read", label: "Read members", labelKey: "toolsUI.integrations.configure.scopeDefs.membersRead", description: "", descriptionKey: "toolsUI.integrations.configure.scopeDefs.membersReadHint", defaultOn: false },
];

interface ActivityEntry {
  id: string;
  kind: "sync" | "auth" | "delivery";
  label: string;
  detail: string;
  status: "ok" | "warn" | "fail";
  at: number;
}

function activityFor(
  app: IntegrationApp,
  t: (k: string) => string,
): ActivityEntry[] {
  const now = Date.now();
  const min = 60_000;
  return [
    {
      id: "a_1",
      kind: "sync",
      label: t("toolsUI.integrations.configure.activity.outboundSync"),
      detail: t("toolsUI.integrations.configure.activity.outboundDetail").replace("{name}", app.name),
      status: "ok",
      at: now - min * 2,
    },
    {
      id: "a_2",
      kind: "delivery",
      label: "call.completed",
      detail: "200 · 84ms",
      status: "ok",
      at: now - min * 8,
    },
    {
      id: "a_3",
      kind: "auth",
      label: t("toolsUI.integrations.configure.activity.tokenRefresh"),
      detail: t("toolsUI.integrations.configure.activity.tokenRefreshDetail"),
      status: "ok",
      at: now - min * 64,
    },
    {
      id: "a_4",
      kind: "delivery",
      label: "buyer.capped",
      detail: "502 · retried successfully",
      status: "warn",
      at: now - min * 152,
    },
    {
      id: "a_5",
      kind: "sync",
      label: t("toolsUI.integrations.configure.activity.inboundSync"),
      detail: t("toolsUI.integrations.configure.activity.inboundDetail"),
      status: "ok",
      at: now - min * 220,
    },
  ];
}

const STATUS_ICON = { ok: CheckCircle2, warn: AlertCircle, fail: AlertCircle } as const;
const STATUS_TONE = {
  ok: "text-[color:var(--success)] bg-[color:var(--success)]/12",
  warn: "text-[color:var(--warning)] bg-[color:var(--warning)]/12",
  fail: "text-destructive bg-destructive/12",
} as const;

export function ConfigureDrawer({ app, onOpenChange, onDisconnect }: Props) {
  const { t } = useTranslation();
  const open = !!app;

  // Local form state — reset each time we open with a new app
  const [token, setToken] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [events, setEvents] = useState<Set<string>>(new Set());
  const [scopes, setScopes] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!app) return;
    // Seed deterministic mock values for this app
    const seed = app.id;
    setToken(`vx_${seed}_••••••••••••••••${seed.slice(0, 4)}`);
    setBaseUrl(`https://api.${seed.replace(/[^a-z0-9]/g, "")}.example/v2`);
    setEvents(new Set(EVENTS.filter((e) => e.defaultOn).map((e) => e.key)));
    setScopes(new Set(SCOPES.filter((s) => s.defaultOn).map((s) => s.key)));
    setActive(true);
  }, [app]);

  const activity = useMemo(() => (app ? activityFor(app, t) : []), [app, t]);

  const toggleEvent = (k: string) =>
    setEvents((curr) => {
      const next = new Set(curr);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  const toggleScope = (s: ScopeDef) => {
    if (s.required) return;
    setScopes((curr) => {
      const next = new Set(curr);
      next.has(s.key) ? next.delete(s.key) : next.add(s.key);
      return next;
    });
  };

  const onTest = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 700));
    setTesting(false);
    toast.success(t("toolsUI.integrations.configure.connection.toastHealthy"), {
      description: t("toolsUI.integrations.configure.connection.toastHealthyDesc").replace(
        "{ms}",
        String(80 + Math.floor(Math.random() * 90)),
      ),
    });
  };
  const onSave = async () => {
    if (!app) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    setSaving(false);
    toast.success(t("toolsUI.integrations.configure.toastSaved").replace("{name}", app.name), {
      description: t("toolsUI.integrations.configure.toastSavedDesc")
        .replace("{events}", String(events.size))
        .replace("{scopes}", String(scopes.size))
        .replace(
          "{status}",
          active
            ? t("toolsUI.integrations.configure.connection.active")
            : t("toolsUI.integrations.configure.connection.paused"),
        ),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {app && (
          <>
            {/* Header */}
            <SheetHeader className="border-b border-border/60 p-6">
              <div className="flex items-start gap-4">
                <AppLogo mark={app.mark} color={app.color} size="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="font-mono text-lg">{app.name}</SheetTitle>
                    <Badge variant="success" className="gap-1">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                      {t("toolsUI.integrations.configure.live")}
                    </Badge>
                  </div>
                  <SheetDescription>{app.description}</SheetDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span>{app.category}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{t("toolsUI.integrations.configure.connectedAt").replace("{time}", app.connectedAt ? formatRelativeTime(app.connectedAt) : "—")}</span>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Tabs */}
            <Tabs defaultValue="connection" className="flex min-h-0 flex-1 flex-col gap-0">
              <div className="border-b border-border/60 px-6 pt-3">
                <TabsList className="bg-secondary/40">
                  <TabsTrigger value="connection">
                    <Plug2 className="h-3 w-3" /> {t("toolsUI.integrations.configure.tabs.connection")}
                  </TabsTrigger>
                  <TabsTrigger value="events">
                    <WebhookIcon className="h-3 w-3" /> {t("toolsUI.integrations.configure.tabs.events")}
                  </TabsTrigger>
                  <TabsTrigger value="permissions">
                    <ShieldCheck className="h-3 w-3" /> {t("toolsUI.integrations.configure.tabs.permissions")}
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <ActivityIcon className="h-3 w-3" /> {t("toolsUI.integrations.configure.tabs.activity")}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Connection */}
                <TabsContent value="connection" className="m-0 space-y-4">
                  <Row label={t("toolsUI.integrations.configure.connection.statusLabel")} hint={t("toolsUI.integrations.configure.connection.statusHint")}>
                    <div className="flex items-center gap-2">
                      <Switch checked={active} onCheckedChange={setActive} />
                      <span className="text-xs font-mono">{active ? t("toolsUI.integrations.configure.connection.active") : t("toolsUI.integrations.configure.connection.paused")}</span>
                    </div>
                  </Row>

                  <Row label={t("toolsUI.integrations.configure.connection.tokenLabel")} hint={t("toolsUI.integrations.configure.connection.tokenHint")}>
                    <div className="flex w-full gap-2">
                      <Input value={token} readOnly className="font-mono" />
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={t("toolsUI.integrations.configure.connection.copyTokenAria")}
                        onClick={() => {
                          navigator.clipboard?.writeText(token).then(() => toast.success(t("toolsUI.integrations.configure.connection.toastTokenCopied")));
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={t("toolsUI.integrations.configure.connection.rotateTokenAria")}
                        onClick={() => toast.success(t("toolsUI.integrations.configure.connection.toastRotateQueued"))}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </Row>

                  <Row label={t("toolsUI.integrations.configure.connection.baseUrlLabel")} hint={t("toolsUI.integrations.configure.connection.baseUrlHint")}>
                    <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="font-mono" />
                  </Row>

                  <div className="rounded-lg border border-dashed border-border/60 bg-secondary/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <div className="font-medium">{t("toolsUI.integrations.configure.connection.connectionTestTitle")}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {t("toolsUI.integrations.configure.connection.connectionTestHint")}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={onTest} disabled={testing}>
                        {testing ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" /> {t("toolsUI.integrations.configure.connection.testing")}
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3" /> {t("toolsUI.integrations.configure.connection.test")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Events */}
                <TabsContent value="events" className="m-0 space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    {t("toolsUI.integrations.configure.events.intro").split("{name}").map((seg, i, arr) => (
                      <React.Fragment key={i}>{seg}{i < arr.length - 1 && <span className="font-mono text-foreground">{app.name}</span>}</React.Fragment>
                    ))}
                  </p>
                  {EVENTS.map((e, i) => {
                    const on = events.has(e.key);
                    return (
                      <motion.div
                        key={e.key}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-xs">{e.label}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{t(e.descriptionKey)}</div>
                        </div>
                        <Switch checked={on} onCheckedChange={() => toggleEvent(e.key)} />
                      </motion.div>
                    );
                  })}
                </TabsContent>

                {/* Permissions */}
                <TabsContent value="permissions" className="m-0 space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    {t("toolsUI.integrations.configure.permissions.intro")}
                  </p>
                  {SCOPES.map((s, i) => {
                    const on = scopes.has(s.key);
                    return (
                      <motion.div
                        key={s.key}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <ShieldCheck className="h-3 w-3 text-accent" />
                            {t(s.labelKey)}
                            {s.required && (
                              <Badge variant="outline" className="text-[9px]">
                                {t("toolsUI.integrations.configure.permissions.required")}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{t(s.descriptionKey)}</div>
                        </div>
                        <Switch
                          checked={on || !!s.required}
                          onCheckedChange={() => toggleScope(s)}
                          disabled={s.required}
                        />
                      </motion.div>
                    );
                  })}
                </TabsContent>

                {/* Activity */}
                <TabsContent value="activity" className="m-0">
                  <ol className="space-y-2">
                    {activity.map((a, i) => {
                      const Icon = STATUS_ICON[a.status];
                      return (
                        <motion.li
                          key={a.id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.2 }}
                          className="flex items-start gap-3 rounded-lg border border-border bg-card/40 p-3"
                        >
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                              STATUS_TONE[a.status],
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs">{a.label}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {formatRelativeTime(a.at)}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">{a.detail}</div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ol>
                </TabsContent>
              </div>

              {/* Sticky footer */}
              <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-card/80 px-6 py-3 backdrop-blur">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    onDisconnect(app.id);
                    onOpenChange(false);
                    toast.success(t("toolsUI.integrations.configure.toastDisconnected").replace("{name}", app.name));
                  }}
                >
                  {t("toolsUI.integrations.configure.disconnect")}
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                    {t("toolsUI.integrations.configure.cancel")}
                  </Button>
                  <Button size="sm" onClick={onSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> {t("toolsUI.integrations.configure.saving")}
                      </>
                    ) : (
                      t("toolsUI.integrations.configure.saveChanges")
                    )}
                  </Button>
                </div>
              </div>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------- helpers ---------- */

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
