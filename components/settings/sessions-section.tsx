"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { SectionShell } from "./profile-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { MOCK_SESSIONS } from "@/lib/mock/settings";

export function SessionsSection() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const revoke = (id: string) => {
    setSessions((ss) => ss.filter((s) => s.id !== id));
    toast.success("Session revoked");
  };

  return (
    <SectionShell
      eyebrow="Sessions"
      title="Active devices"
      description="Where you're signed in right now. Revoke anything that looks unfamiliar."
    >
      <Card>
        <CardContent className="divide-y divide-border/60 p-0">
          {sessions.map((s, i) => {
            const Icon = s.device.toLowerCase().includes("iphone") || s.device.toLowerCase().includes("ios")
              ? Smartphone
              : Monitor;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/20"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary/60 text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{s.device}</span>
                    {s.current && (
                      <Badge variant="success">This device</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground font-mono">
                    {s.browser} · {s.ip}
                    {s.city && <span> · {s.city}</span>}
                  </div>
                </div>
                <div className="hidden text-right text-[11px] text-muted-foreground sm:block">
                  Active {formatRelativeTime(s.lastActiveAt)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  disabled={s.current}
                  onClick={() => revoke(s.id)}
                >
                  <LogOut className="h-3 w-3" />
                  Revoke
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => {
            setSessions((ss) => ss.filter((s) => s.current));
            toast.success("All other sessions revoked");
          }}
        >
          Sign out of everywhere else
        </Button>
      </div>
    </SectionShell>
  );
}
