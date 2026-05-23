/**
 * In-app page header — title, optional description, optional right-side actions.
 * Renders a subtle accent rule underneath for visual hierarchy.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("relative pb-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {/* Subtle gradient rule */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--border) 20%, var(--border) 80%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-24"
        style={{
          background: "linear-gradient(to right, var(--accent), transparent)",
        }}
      />
    </div>
  );
}
