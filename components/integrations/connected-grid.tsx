"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MoreVertical } from "lucide-react";

import { AppLogo } from "./app-logo";
import { ConfigureDrawer } from "./configure-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/format";
import type { IntegrationApp } from "@/lib/types";

interface Props {
  apps: IntegrationApp[];
  onDisconnect: (id: string) => void;
}

export function ConnectedGrid({ apps, onDisconnect }: Props) {
  const [configuring, setConfiguring] = useState<IntegrationApp | null>(null);

  if (apps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-secondary/30 p-6 text-center text-xs text-muted-foreground">
        No integrations connected yet. Pick one from the catalog below.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {apps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <Card
              className="cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:border-accent/40"
              onClick={() => setConfiguring(app)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <AppLogo mark={app.mark} color={app.color} size="h-10 w-10" />
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[color:var(--success)]">
                      <Check className="h-2.5 w-2.5" />
                      Live
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setConfiguring(app)}>
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onDisconnect(app.id)}
                        >
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <h3 className="mt-3 truncate text-sm font-semibold">{app.name}</h3>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{app.description}</p>

                <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Connected {app.connectedAt ? formatRelativeTime(app.connectedAt) : "—"}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <ConfigureDrawer
        app={configuring}
        onOpenChange={(open) => {
          if (!open) setConfiguring(null);
        }}
        onDisconnect={onDisconnect}
      />
    </>
  );
}
