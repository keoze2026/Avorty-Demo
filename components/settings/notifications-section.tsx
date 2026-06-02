"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

import { SectionShell } from "./profile-section";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import { MOCK_NOTIFICATIONS } from "@/lib/mock/settings";

/** Maps the mock event keys to their workspaceUI translation paths. */
const EVENT_KEYS: Record<string, { label: string; desc: string }> = {
  "call.completed": {
    label: "workspaceUI.notifications.events.callCompleted",
    desc: "workspaceUI.notifications.events.callCompletedDesc",
  },
  "buyer.capped": {
    label: "workspaceUI.notifications.events.buyerCapped",
    desc: "workspaceUI.notifications.events.buyerCappedDesc",
  },
  "publisher.spike": {
    label: "workspaceUI.notifications.events.publisherSpike",
    desc: "workspaceUI.notifications.events.publisherSpikeDesc",
  },
  "webhook.failing": {
    label: "workspaceUI.notifications.events.webhookFailing",
    desc: "workspaceUI.notifications.events.webhookFailingDesc",
  },
  "billing.invoice": {
    label: "workspaceUI.notifications.events.billingInvoice",
    desc: "workspaceUI.notifications.events.billingInvoiceDesc",
  },
  "ai.recommendation": {
    label: "workspaceUI.notifications.events.aiRecommendation",
    desc: "workspaceUI.notifications.events.aiRecommendationDesc",
  },
};

export function NotificationsSection() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(MOCK_NOTIFICATIONS);

  const toggle = (key: string, channel: "email" | "inApp" | "sms") => {
    setPrefs((ps) =>
      ps.map((p) => (p.key === key ? { ...p, [channel]: !p[channel] } : p)),
    );
  };

  return (
    <SectionShell
      eyebrow={t("settings.notificationsSection.eyebrow")}
      title={t("settings.notificationsSection.title")}
      description={t("settings.notificationsSection.description")}
    >
      <Card className="overflow-hidden">
        <div className="hidden border-b border-border/60 bg-secondary/30 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_5rem_5rem]">
          <span>{t("workspaceUI.notifications.columnEvent")}</span>
          <span className="text-center">{t("workspaceUI.notifications.columnInApp")}</span>
          <span className="text-center">{t("workspaceUI.notifications.columnEmail")}</span>
          <span className="text-center">{t("workspaceUI.notifications.columnSms")}</span>
        </div>

        <CardContent className="divide-y divide-border/60 p-0">
          {prefs.map((p, i) => {
            const keys = EVENT_KEYS[p.key];
            const label = keys ? t(keys.label) : p.label;
            const description = keys ? t(keys.desc) : p.description;
            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="grid items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_5rem_5rem_5rem]"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Bell className="h-3 w-3 text-accent" />
                    {label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{description}</div>
                </div>
                <Cell label={t("workspaceUI.notifications.columnInApp")} icon={MessageSquare} on={p.inApp} onToggle={() => toggle(p.key, "inApp")} />
                <Cell label={t("workspaceUI.notifications.columnEmail")} icon={Mail} on={p.email} onToggle={() => toggle(p.key, "email")} />
                <Cell label={t("workspaceUI.notifications.columnSms")} icon={Smartphone} on={p.sms} onToggle={() => toggle(p.key, "sms")} />
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function Cell({
  label,
  icon: Icon,
  on,
  onToggle,
}: {
  label: string;
  icon: typeof Bell;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between sm:justify-center">
      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:hidden">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <Switch checked={on} onCheckedChange={onToggle} />
    </div>
  );
}
