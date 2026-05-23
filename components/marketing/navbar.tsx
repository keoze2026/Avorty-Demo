"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const SECTIONS = [
  { href: "#features", label: "Platform" },
  { href: "#developer-experience", label: "Live" },
  { href: "#built-for-react", label: "Routing" },
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Wordmark size="md" uid="nav" />
          <nav className="hidden items-center gap-6 md:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onClick={(e) => handleSmoothScroll(e, s.href)}
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href={ROUTES.login}>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href={ROUTES.signup}>
            <Button size="sm">Get started</Button>
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
      </div>

      {isOpen && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <nav className="flex flex-col gap-4 px-4 py-6">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onClick={(e) => handleSmoothScroll(e, s.href)}
                className="cursor-pointer text-sm text-muted-foreground"
              >
                {s.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              <Link href={ROUTES.login}>
                <Button variant="ghost" size="sm" className="w-full">
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
    </header>
  );
}
