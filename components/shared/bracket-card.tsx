/**
 * BracketCard — wrapper surface used across Live Monitor modules.
 * Previously rendered HUD-style corner brackets + accent rule + micro grid;
 * now a clean card. Prop signature is preserved (no-op flags) so consumers
 * don't need updating.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface BracketCardProps extends React.HTMLAttributes<HTMLDivElement> {
  rule?: boolean;
  grid?: boolean;
  tone?: "accent" | "muted";
  interactive?: boolean;
  padded?: boolean;
}

export function BracketCard({
  className,
  children,
  interactive = false,
  padded = true,
  // Decorative flags are accepted for compat but no longer rendered:
  rule: _rule,
  grid: _grid,
  tone: _tone,
  ...props
}: BracketCardProps) {
  void _rule;
  void _grid;
  void _tone;
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card",
        interactive &&
          "transition-shadow hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_25%,transparent)]",
        className,
      )}
      {...props}
    >
      <div className={cn("relative", padded && "p-5")}>{children}</div>
    </div>
  );
}
