/**
 * Centered card frame used by login / signup / forgot-password.
 *
 * Designed to live on top of the auth layout's vortex canvas: stronger
 * glass (`bg-card/85 backdrop-blur-2xl`), accent-tinted hairline border, a
 * subtle top-down gradient sheen, and a soft shadow that picks up the brand
 * color so the card harmonizes with the orbital glow behind it. Works the
 * same in light and dark mode because every value is theme-aware.
 */

import * as React from "react";

import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-accent/15 bg-card/85 p-9 backdrop-blur-2xl",
        // Layered shadow: a deep cool drop for elevation, plus a soft accent
        // glow so the card reads as part of the same atmosphere as the
        // vortex behind it.
        "shadow-[0_30px_80px_-40px_rgba(8,10,32,0.55),0_0_40px_-20px_color-mix(in_oklch,var(--accent)_45%,transparent)]",
        className,
      )}
    >
      {/* Subtle top-down sheen — gives the card a hint of dimensional
          gloss without distracting from the form below it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/[0.08] to-transparent"
      />

      <div className="relative">
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <Wordmark href={null} iconOnly size="md" uid="auth" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {children}

        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
