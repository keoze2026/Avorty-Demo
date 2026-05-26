/**
 * BracketCard — a card surface with HUD-style corner brackets,
 * a thin top accent rule, and an optional micro-grid background.
 *
 * Used across the redesigned Dashboard, Live Monitor, and Campaigns
 * pages to give every module a uniform "instrument panel" feel.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface BracketCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the accent gradient rule across the top of the card. */
  rule?: boolean;
  /** Render the 8px micro-grid behind the content. */
  grid?: boolean;
  /** Bracket tone — accent (teal) or muted. */
  tone?: "accent" | "muted";
  /** Apply soft glow on hover (used on interactive cards). */
  interactive?: boolean;
  /** Pad the inner content. Pass false when the child controls its own padding. */
  padded?: boolean;
}

export function BracketCard({
  className,
  children,
  rule = true,
  grid = false,
  tone = "accent",
  interactive = false,
  padded = true,
  ...props
}: BracketCardProps) {
  return (
    <div
      className={cn(
        "group/bracket relative rounded-xl border border-border bg-card",
        interactive && "transition-shadow hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_25%,transparent)]",
        className,
      )}
      {...props}
    >
      {/* Top accent rule */}
      {rule && (
        <div aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px edge-rule-top" />
      )}

      {/* Corner brackets — 4 absolutely-positioned L-shapes */}
      <Bracket position="tl" tone={tone} />
      <Bracket position="tr" tone={tone} />
      <Bracket position="bl" tone={tone} />
      <Bracket position="br" tone={tone} />

      {/* Optional micro-grid background — masked so it fades at edges */}
      {grid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl bg-micro-grid opacity-[0.35]"
          style={{
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 35%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 35%, transparent 90%)",
          }}
        />
      )}

      <div className={cn("relative", padded && "p-5")}>{children}</div>
    </div>
  );
}

interface BracketProps {
  position: "tl" | "tr" | "bl" | "br";
  tone: NonNullable<BracketCardProps["tone"]>;
}

function Bracket({ position, tone }: BracketProps) {
  const color = tone === "accent" ? "border-accent/55" : "border-border";
  const map: Record<BracketProps["position"], string> = {
    tl: "top-0 left-0 border-t-[1.5px] border-l-[1.5px] rounded-tl-xl",
    tr: "top-0 right-0 border-t-[1.5px] border-r-[1.5px] rounded-tr-xl",
    bl: "bottom-0 left-0 border-b-[1.5px] border-l-[1.5px] rounded-bl-xl",
    br: "bottom-0 right-0 border-b-[1.5px] border-r-[1.5px] rounded-br-xl",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-3 w-3",
        color,
        map[position],
      )}
    />
  );
}
