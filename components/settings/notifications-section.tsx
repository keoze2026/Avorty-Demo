"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

import { SectionShell } from "./profile-section";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MOCK_NOTIFICATIONS } from "@/lib/mock/settings";

export function NotificationsSection() {
  const [prefs, setPrefs] = useState(MOCK_NOTIFICATIONS);

  const toggle = (key: string, channel: "email" | "inApp" | "sms") => {
    setPrefs((ps) =>
      ps.map((p) => (p.key === key ? { ...p, [channel]: !p[channel] } : p)),
    );
  };

  return (
    <SectionShell
      eyebrow="Notifications"
      title="What you hear about, where"
      description="Pick the events that interrupt your day and where they should land."
    >
      <Card className="overflow-hidden">
        <div className="hidden border-b border-border/60 bg-secondary/30 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_5rem_5rem]">
          <span>Event</span>
          <span className="text-center">In-app</span>
          <span className="text-center">Email</span>
          <span className="text-center">SMS</span>
        </div>

        <CardContent className="divide-y divide-border/60 p-0">
          {prefs.map((p, i) => (
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
                  {p.label}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{p.description}</div>
              </div>
              <Cell label="In-app" icon={MessageSquare} on={p.inApp} onToggle={() => toggle(p.key, "inApp")} />
              <Cell label="Email" icon={Mail} on={p.email} onToggle={() => toggle(p.key, "email")} />
              <Cell label="SMS" icon={Smartphone} on={p.sms} onToggle={() => toggle(p.key, "sms")} />
            </motion.div>
          ))}
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
