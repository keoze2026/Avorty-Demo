"use client";

import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { ROUTES } from "@/lib/constants";

const SECTIONS = [
  { href: "#features", label: "Platform" },
  { href: "#code", label: "Live" },
  { href: "#code", label: "API" },
  { href: "#how-it-works", label: "Pricing" },
  { href: "#cta", label: "Enterprise" },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="w-full flex justify-center px-6 py-4">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <Wordmark size="sm" uid="nav" gradient={false} />
          <div className="hidden md:flex items-center gap-8">
            {SECTIONS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.login}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.signup}
              className="text-sm text-foreground bg-secondary hover:bg-secondary/80 px-3.5 py-1.5 rounded-md border border-border transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
