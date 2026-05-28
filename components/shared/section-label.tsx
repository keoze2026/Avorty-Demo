/**
 * SectionLabel — title row used at the top of bento tiles.
 * Previously rendered "01 / SECTION" mono-caps HUD style; now a clean
 * sans-serif heading. Prop signature is preserved for compat.
 */

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface SectionLabelProps {
  index: number | string;
  title: string;
  meta?: React.ReactNode;
  action?: { href: string; label: string } | React.ReactNode;
  className?: string;
}

export function SectionLabel({ title, meta, action, className }: SectionLabelProps) {
  const isLink =
    action && typeof action === "object" && "href" in (action as object) && "label" in (action as object);

  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        {meta && (
          <span className="hidden text-xs text-muted-foreground sm:inline">{meta}</span>
        )}
      </div>

      {action &&
        (isLink ? (
          <Link
            href={(action as { href: string }).href}
            className="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            {(action as { label: string }).label}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        ) : (
          <div className="shrink-0">{action as React.ReactNode}</div>
        ))}
    </div>
  );
}
