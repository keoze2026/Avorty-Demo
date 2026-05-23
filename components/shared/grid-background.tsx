/**
 * Signature dotted/lined grid background — theme-aware via --grid-line.
 * Renders behind content; pair with a radial mask for the centerpiece look.
 */

import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
  /** size of one grid cell, in rem (default 4rem) */
  cell?: number;
  /** apply the radial fade mask */
  mask?: boolean;
  /** subtle accent glow at the top */
  glow?: boolean;
  /** "lines" (default) or "dots" */
  variant?: "lines" | "dots";
}

export function GridBackground({
  className,
  cell = 4,
  mask = true,
  glow = false,
  variant = "lines",
}: GridBackgroundProps) {
  const linesBg =
    "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)";
  const dotsBg = "radial-gradient(circle, var(--grid-line) 1px, transparent 1px)";

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: variant === "dots" ? dotsBg : linesBg,
          backgroundSize: `${cell}rem ${cell}rem`,
          maskImage: mask
            ? "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 110%)"
            : undefined,
        }}
      />
      {glow && (
        <div
          className="absolute inset-x-0 top-0 h-[40rem] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, var(--vortyx-glow), transparent 70%)",
          }}
        />
      )}
    </div>
  );
}
