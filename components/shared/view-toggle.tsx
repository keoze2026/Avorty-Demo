"use client";

import { LayoutGrid, Rows3 } from "lucide-react";

import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "table";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  className?: string;
}

const OPTIONS: Array<{ id: ViewMode; icon: typeof LayoutGrid; label: string }> = [
  { id: "grid", icon: LayoutGrid, label: "Grid" },
  { id: "table", icon: Rows3, label: "Table" },
];

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View"
      className={cn("inline-flex gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5", className)}
    >
      {OPTIONS.map((o) => {
        const active = o.id === value;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-mono transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
