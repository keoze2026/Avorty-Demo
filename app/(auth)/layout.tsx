"use client";

import type { ReactNode } from "react";

import { BrandVortex } from "@/components/auth/brand-vortex";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useTranslation } from "@/hooks/use-translation";

/**
 * Asymmetric split layout. The vortex spans the entire viewport — its centre
 * is biased left, but the outer rings reach into the right column so both
 * zones share the same atmosphere instead of feeling like two stitched-on
 * panels. There's no opaque curtain or hard divider between the columns; the
 * form panel is its own substantial glass card with an accent halo that
 * harmonizes with the orbital colors behind it.
 *
 * Theme-aware: the vortex and every Tailwind theme variable used here swap
 * cleanly between light and dark mode.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Vortex covers the full viewport behind the grid. */}
      <BrandVortex centerX={0.38} />

      {/* Theme toggle pinned to the top-right of the viewport. */}
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[3fr_2fr]">
        {/* ─── Left column ───────────────────────────────────────── */}
        <aside className="relative hidden flex-col px-12 py-10 lg:flex xl:px-20 xl:py-14">
          <header>
            <Wordmark href={null} size="lg" uid="auth-mark" />
          </header>

          {/* Middle group fills the remaining height between header + footer
              and centres itself vertically with margin-block:auto. Keeps the
              composition balanced even when the viewport is short. */}
          <div className="my-auto max-w-xl space-y-6">
            <h2 className="text-4xl font-medium leading-[1.05] tracking-tight text-foreground xl:text-[3.4rem]">
              {t("authUI.split.tagline")}
            </h2>
            <p className="max-w-md text-base text-muted-foreground">
              {t("authUI.split.taglineSub")}
            </p>
          </div>

          <footer className="text-xs text-muted-foreground/80">
            {t("authUI.split.footer")}
          </footer>
        </aside>

        {/* ─── Right column ─────────────────────────────────────── */}
        <section className="relative flex items-center justify-center px-6 py-12 lg:px-10 lg:py-16">
          {/* Ambient halo behind the card — picks up the orbital colors so
              the card feels like it belongs in the vortex's atmosphere. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_60%)] opacity-[0.08] blur-3xl"
          />

          <div className="relative w-full max-w-[26rem]">
            {/* Mobile-only brand mark above the form. */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Wordmark href={null} size="md" uid="auth-mobile" />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
