"use client";

/**
 * Marketing navbar — quiet, sophisticated.
 * Centered nav, light font weights, no glow, no animated indicators.
 */

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const SECTIONS = [
  { href: "#features", label: "Features" },
  { href: "#docs", label: "Resources" },
  { href: "#enterprise", label: "Company" },
  { href: "#testimonials", label: "Customers" },
  { href: "#pricing", label: "Pricing" },
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left — brand only */}
        <Wordmark size="sm" uid="nav" />

        {/* Center — section links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                onClick={(e) => handleSmoothScroll(e, s.href)}
                className="cursor-pointer text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right — auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={ROUTES.login}
            className="px-3 py-1.5 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
          >
            Login
          </Link>
          <Link href={ROUTES.signup}>
            <Button size="sm" className="h-8 rounded-full px-4 text-sm font-medium">
              Start for free
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
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
                  Login
                </Button>
              </Link>
              <Link href={ROUTES.signup}>
                <Button size="sm" className="w-full">
                  Start for free
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
