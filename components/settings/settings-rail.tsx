"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Bell, KeyRound, Monitor, UserCog } from "lucide-react";

import { cn } from "@/lib/utils";

export type SettingsSection =
  | "profile"
  | "api-keys"
  | "notifications"
  | "sessions";

interface RailItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: LucideIcon;
}

const ITEMS: RailItem[] = [
  { id: "profile", label: "Profile", description: "Personal account", icon: UserCog },
  { id: "api-keys", label: "API keys", description: "Programmatic access", icon: KeyRound },
  { id: "notifications", label: "Notifications", description: "Channels + alerts", icon: Bell },
  { id: "sessions", label: "Sessions", description: "Active devices", icon: Monitor },
];

interface Props {
  active: SettingsSection;
  onSelect: (id: SettingsSection) => void;
}

export function SettingsRail({ active, onSelect }: Props) {
  return (
    <aside className="space-y-1.5">
      <h2 className="px-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
        Settings
      </h2>
      <ul className="space-y-1">
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "group relative flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
                  isActive
                    ? "border-accent/40 bg-accent/8 shadow-sm"
                    : "border-transparent hover:border-border hover:bg-secondary/40",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="settings-rail-active"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-accent"
                  />
                )}
                <span
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "bg-secondary/60 text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className={cn("text-sm font-medium", isActive && "text-foreground")}>
                    {item.label}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{item.description}</div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </aside>
  );
}
