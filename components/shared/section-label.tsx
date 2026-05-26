/**
 * SectionLabel — numbered monospace section header.
 *   01 / Revenue stream            view all →
 *
 * Used as the top row of every bento tile so the page reads like
 * an instrument panel rather than a stack of cards.
 */

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface SectionLabelProps {
  /** Sequence number, e.g. "01". Padded automatically. */
  index: number | string;
  /** Section title (rendered in mono caps). */
  title: string;
  /** Optional sub/right text, e.g. "Today" or "Last 24h". */
  meta?: React.ReactNode;
  /** Optional right-side action — link OR plain node. */
  action?: { href: string; label: string } | React.ReactNode;
  className?: string;
}

export function SectionLabel({ index, title, meta, action, className }: SectionLabelProps) {
  const padded = typeof index === "number" ? index.toString().padStart(2, "0") : index;
  const isLink =
    action && typeof action === "object" && "href" in (action as object) && "label" in (action as object);

  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent">
          {padded}
        </span>
        <span aria-hidden className="h-3 w-px bg-border" />
        <h2 className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/85">
          {title}
        </h2>
        {meta && (
          <span className="hidden text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:inline">
            {meta}
          </span>
        )}
      </div>

      {action &&
        (isLink ? (
          <Link
            href={(action as { href: string }).href}
            className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent"
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
