"use client";

/**
 * Marketing navbar — glassmorphic, premium feel.
 * - Glass surface with strong backdrop blur
 * - Gradient wordmark
 * - Live network indicator with pulsing dot
 * - Bigger spacing, accent underline on hover
 * - Teal CTA with lift + brightness on hover
 */

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "#features", label: "Platform" },
  { href: "#developer-experience", label: "Live" },
  { href: "#built-for-react", label: "API" },
  { href: "#docs", label: "Docs" },
  { href: "#pricing", label: "Pricing" },
  { href: "#enterprise", label: "Enterprise" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Floating glass shell, sits a few px in from the edges */}
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4">
        <nav className="glass relative flex h-14 items-center justify-between rounded-2xl px-3 sm:h-16 sm:px-5">
          {/* Top accent hairline */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, color-mix(in oklab, var(--accent) 50%, transparent), transparent)",
            }}
          />

          <div className="flex items-center gap-6">
            <Wordmark size="md" uid="nav" />

            {/* Live network indicator */}
            <span className="hidden items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground md:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--vortyx-teal)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--vortyx-teal)]" />
              </span>
              Live network
            </span>

            <ul className="hidden items-center gap-1 lg:flex">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    onClick={(e) => handleSmoothScroll(e, s.href)}
                    className={cn(
                      "group relative inline-flex h-9 cursor-pointer items-center rounded-md px-3 text-sm text-muted-foreground transition-colors",
                      "hover:text-foreground",
                    )}
                  >
                    {s.label}
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-1 h-px scale-x-0 bg-[color:var(--vortyx-teal)] transition-transform duration-200 group-hover:scale-x-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={ROUTES.login}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link href={ROUTES.signup}>
              <Button
                size="sm"
                className="group h-9 gap-1.5 rounded-xl px-4 font-semibold shadow-lg shadow-[color:var(--vortyx-teal)]/20 transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Get started free
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {isOpen && (
          <div className="glass mt-2 rounded-2xl p-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={(e) => handleSmoothScroll(e, s.href)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href={ROUTES.login}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href={ROUTES.signup}>
                  <Button size="sm" className="w-full">
                    Get started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
