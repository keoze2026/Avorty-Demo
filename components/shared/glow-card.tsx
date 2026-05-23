/**
 * Card with a subtle accent glow behind it.
 * Use for hero modules and dashboard headline tiles.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** intensity 0-1 */
  intensity?: number;
}

export function GlowCard({ className, intensity = 0.4, children, ...props }: GlowCardProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-2xl blur-3xl"
        style={{
          background:
            "linear-gradient(90deg, var(--vortyx-glow), transparent 30%, var(--vortyx-glow))",
          opacity: intensity,
        }}
      />
      <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden">
        {children}
      </div>
    </div>
  );
}
