"use client";

import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { SectionShell } from "./profile-section";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  type NotificationChannel,
  useNotificationsRulesStore,
} from "@/lib/store/notifications-rules-store";

/** Canonical event catalog the settings UI surfaces. The backend accepts any
 *  event string; this list is what the user can toggle via this screen. */
const EVENT_CATALOG: Array<{
  key: string;
  fallbackLabel: string;
  fallbackDesc: string;
  labelKey: string;
  descKey: string;
}> = [
  {
    key: "call.completed",
    fallbackLabel: "Call completed",
    fallbackDesc: "When a call settles and pays out.",
    labelKey: "workspaceUI.notifications.events.callCompleted",
    descKey: "workspaceUI.notifications.events.callCompletedDesc",
  },
  {
    key: "buyer.capped",
    fallbackLabel: "Buyer reached cap",
    fallbackDesc: "When a buyer hits their daily / monthly cap.",
    labelKey: "workspaceUI.notifications.events.buyerCapped",
    descKey: "workspaceUI.notifications.events.buyerCappedDesc",
  },
  {
    key: "publisher.spike",
    fallbackLabel: "Publisher traffic spike",
    fallbackDesc: "Volume up >50% vs trailing 24h average.",
    labelKey: "workspaceUI.notifications.events.publisherSpike",
    descKey: "workspaceUI.notifications.events.publisherSpikeDesc",
  },
  {
    key: "webhook.failing",
    fallbackLabel: "Webhook failing",
    fallbackDesc: "5+ consecutive delivery failures.",
    labelKey: "workspaceUI.notifications.events.webhookFailing",
    descKey: "workspaceUI.notifications.events.webhookFailingDesc",
  },
  {
    key: "billing.invoice",
    fallbackLabel: "Invoice ready",
    fallbackDesc: "Monthly invoice or receipt.",
    labelKey: "workspaceUI.notifications.events.billingInvoice",
    descKey: "workspaceUI.notifications.events.billingInvoiceDesc",
  },
  {
    key: "ai.recommendation",
    fallbackLabel: "AI recommendation",
    fallbackDesc: "New optimization suggestion.",
    labelKey: "workspaceUI.notifications.events.aiRecommendation",
    descKey: "workspaceUI.notifications.events.aiRecommendationDesc",
  },
];

export function NotificationsSection() {
  const { t } = useTranslation();
  const rules = useNotificationsRulesStore((s) => s.rules);
  const setEnabled = useNotificationsRulesStore((s) => s.setEnabled);
  const userEmail = useAuthStore((s) => s.user?.email ?? "");

  // Subscribing to `rules` re-renders the section whenever any toggle flips
  // (locally or via another tab). We compute isActive per render from the
  // current rules array — cheap, since there are at most a few dozen rules.
  const isOn = (event: string, channel: NotificationChannel) => {
    const rule = rules.find((r) => r.event === event && r.channel === channel);
    return !!rule && rule.isActive;
  };

  const toggle = async (event: string, channel: NotificationChannel) => {
    if (!userEmail) {
      toast.error("Sign-in required to update notification preferences.");
      return;
    }
    const next = !isOn(event, channel);
    try {
      await setEnabled(event, channel, next, userEmail);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save preference");
    }
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
          {EVENT_CATALOG.map((p, i) => {
            // Use the translated label if it resolves to something other than
            // the key itself (i.e. the key exists in the locale file); fall
            // back to the canonical English label so adding a new event
            // doesn't require an i18n PR before it renders.
            const labelT = t(p.labelKey);
            const descT = t(p.descKey);
            const label = labelT === p.labelKey ? p.fallbackLabel : labelT;
            const description = descT === p.descKey ? p.fallbackDesc : descT;
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
                <Cell label={t("workspaceUI.notifications.columnInApp")} icon={MessageSquare} on={isOn(p.key, "in_app")} onToggle={() => toggle(p.key, "in_app")} />
                <Cell label={t("workspaceUI.notifications.columnEmail")} icon={Mail} on={isOn(p.key, "email")} onToggle={() => toggle(p.key, "email")} />
                <Cell label={t("workspaceUI.notifications.columnSms")} icon={Smartphone} on={isOn(p.key, "sms")} onToggle={() => toggle(p.key, "sms")} />
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
