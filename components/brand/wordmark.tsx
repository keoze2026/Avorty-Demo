/**
 * Avortyx wordmark — logo + product name lock-up.
 * The product name uses an indigo gradient when `gradient` is enabled — gives
 * the navbar / hero a memorable signature flourish that matches the brand.
 */

import Link from "next/link";

import { Logo } from "./logo";
import { BRAND, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  /** Pass `null` to render without a link wrapper (e.g. inside the auth card). */
  href?: string | null;
  size?: "sm" | "md" | "lg";
  /** Hide the product name (logo-only) */
  iconOnly?: boolean;
  /** Apply the brand gradient on the wordmark text (default true). */
  gradient?: boolean;
  uid?: string;
}

const SIZE = {
  sm: { logo: "h-6 w-6", text: "text-sm tracking-tight" },
  md: { logo: "h-8 w-8", text: "text-xl tracking-tight" },
  lg: { logo: "h-10 w-10", text: "text-2xl tracking-tight" },
} as const;

export function Wordmark({
  className,
  href = ROUTES.home,
  size = "md",
  iconOnly = false,
  gradient = true,
  uid,
}: WordmarkProps) {
  const s = SIZE[size];

  const content = (
    <span className={cn("flex items-center gap-2", className)}>
      <Logo className={s.logo} uid={uid} />
      {!iconOnly && (
        <span
          className={cn("font-bold", s.text)}
          style={
            gradient
              ? {
                  background:
                    "linear-gradient(120deg, #3A4BC4 0%, #5266E0 50%, #818CF8 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }
              : undefined
          }
        >
          {BRAND.name}
        </span>
      )}
    </span>
  );

  return href ? (
    <Link href={href} aria-label={BRAND.name}>
      {content}
    </Link>
  ) : (
    content
  );
}
