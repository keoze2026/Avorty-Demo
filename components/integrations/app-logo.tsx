/**
 * Square brand-color tile used as a stand-in for real partner logos.
 * Keeps the catalog visually consistent without hosting third-party assets.
 */

import { cn } from "@/lib/utils";

interface Props {
  /** 1–2 letter mark */
  mark: string;
  /** Background hex */
  color: string;
  /** Tailwind size class for the wrapper (e.g. "h-12 w-12") */
  size?: string;
  className?: string;
}

export function AppLogo({ mark, color, size = "h-12 w-12", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-sans font-bold text-white shadow-md",
        size,
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${color}, ${shade(color, -25)})`,
      }}
      aria-hidden
    >
      {mark}
    </span>
  );
}

/** Quick hex-shade helper for the gradient lower stop. */
function shade(hex: string, amount: number) {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map((c) => parseInt(c, 16));
  const adj = (n: number) => Math.max(0, Math.min(255, n + amount));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(adj(r))}${toHex(adj(g))}${toHex(adj(b))}`;
}
