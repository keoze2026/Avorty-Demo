"use client";

import { motion } from "framer-motion";
import { BarChart3, Bookmark, Sparkles, Star, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SavedReport {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  starred?: boolean;
}

export const SAVED_REPORTS: SavedReport[] = [
  {
    id: "default",
    name: "Network overview",
    description: "All campaigns, all sources, last 7 days.",
    icon: BarChart3,
    starred: true,
  },
  {
    id: "health",
    name: "Health vertical",
    description: "Tier-1 health campaigns only, last 30 days.",
    icon: Star,
  },
  {
    id: "weekend",
    name: "Weekend performance",
    description: "Sat / Sun call volume + conversion.",
    icon: Sparkles,
  },
  {
    id: "qbr",
    name: "Quarterly QBR pack",
    description: "Top buyers, top publishers, payouts.",
    icon: Bookmark,
  },
];

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function SavedReportsRail({ activeId, onSelect, className }: Props) {
  return (
    <aside className={cn("flex h-full flex-col gap-2", className)}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          Saved reports
        </h2>
        <button
          className="text-[10px] text-muted-foreground hover:text-foreground"
          type="button"
        >
          + New
        </button>
      </div>

      <ul className="space-y-1.5">
        {SAVED_REPORTS.map((r, i) => {
          const Icon = r.icon;
          const active = r.id === activeId;
          return (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => onSelect(r.id)}
                className={cn(
                  "group flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                  active
                    ? "border-accent/50 bg-accent/10 shadow-sm"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-accent/30",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    active ? "bg-accent/15 text-accent" : "bg-secondary/60 text-muted-foreground group-hover:text-accent",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {r.name}
                    {r.starred && <Star className="h-3 w-3 fill-accent text-accent" />}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                    {r.description}
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </aside>
  );
}
