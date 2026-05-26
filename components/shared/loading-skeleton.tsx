/**
 * HUD-flavored skeletons used by route-level loading.tsx files.
 * Mirror the bracket-card / section-label visual language so the
 * loading state feels like part of the same instrument panel rather
 * than a generic gray block.
 */

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────── */

/** Page header skeleton — matches `PageHeader` height + bottom rule. */
export function PageHeaderSkeleton({ width = "12rem" }: { width?: string }) {
  return (
    <div className="relative pb-6">
      <Skeleton className="h-8 rounded-md" style={{ width }} />
      <Skeleton className="mt-2 h-4 w-[28rem] max-w-full rounded-md" />
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
        style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

/** Hero band — wraps a content block in the bracket/corner-crosshair chrome
 *  so the loading state visually matches the redesigned hero panels. */
export function BracketSkeleton({
  children,
  className,
  height = "h-44",
}: {
  children?: React.ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      {/* Accent rule + crosshairs */}
      <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px edge-rule-top" />
      <Crosshair className="left-3 top-3" />
      <Crosshair className="right-3 top-3" />
      <Crosshair className="left-3 bottom-3" />
      <Crosshair className="right-3 bottom-3" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-hex-dot opacity-30" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-60"
        style={{ background: "var(--vortyx-glow)" }}
      />
      <div className={cn("relative", height)}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

/** Numbered section label skeleton — `01 | TITLE …` stub. */
export function SectionLabelSkeleton({ index }: { index: number | string }) {
  const padded = typeof index === "number" ? index.toString().padStart(2, "0") : index;
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent/40">
        {padded}
      </span>
      <span aria-hidden className="h-3 w-px bg-border" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

/** A standard card skeleton — bracket border + section label + body. */
export function CardSkeleton({
  index,
  height = "h-44",
  className,
}: {
  index: number | string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5",
        className,
      )}
    >
      {/* Corner brackets */}
      <Bracket position="tl" />
      <Bracket position="tr" />
      <Bracket position="bl" />
      <Bracket position="br" />

      <SectionLabelSkeleton index={index} />
      <Skeleton className={cn("w-full rounded-lg", height)} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

/** Reusable list-row skeleton stack (n rows). */
export function RowsSkeleton({ rows = 6, rowHeight = "h-14" }: { rows?: number; rowHeight?: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn(rowHeight, "w-full rounded-lg")} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function Bracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const map: Record<typeof position, string> = {
    tl: "top-0 left-0 border-t-[1.5px] border-l-[1.5px] rounded-tl-xl",
    tr: "top-0 right-0 border-t-[1.5px] border-r-[1.5px] rounded-tr-xl",
    bl: "bottom-0 left-0 border-b-[1.5px] border-l-[1.5px] rounded-bl-xl",
    br: "bottom-0 right-0 border-b-[1.5px] border-r-[1.5px] rounded-br-xl",
  };
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute h-3 w-3 border-accent/30", map[position])}
    />
  );
}

function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-2.5 w-2.5",
        "before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-accent/40",
        "after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-translate-y-1/2 after:bg-accent/40",
        className,
      )}
    />
  );
}
