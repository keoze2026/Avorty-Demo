/**
 * Vortyx wordmark — logo + product name lock-up.
 * Use in navbars, footers, sidebars. Sizes scale uniformly.
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
  uid?: string;
}

const SIZE = {
  sm: { logo: "h-6 w-6", text: "text-sm" },
  md: { logo: "h-8 w-8", text: "text-lg" },
  lg: { logo: "h-10 w-10", text: "text-xl" },
} as const;

export function Wordmark({
  className,
  href = ROUTES.home,
  size = "md",
  iconOnly = false,
  uid,
}: WordmarkProps) {
  const s = SIZE[size];
  const content = (
    <span className={cn("flex items-center gap-2", className)}>
      <Logo className={s.logo} uid={uid} />
      {!iconOnly && (
        <span className={cn("font-mono font-semibold tracking-tight", s.text)}>{BRAND.name}</span>
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
