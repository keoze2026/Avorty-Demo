/**
 * Marketing footer — two-layer.
 *
 * Top layer: brand block + 4 link columns + email signup.
 * Bottom bar: copyright + social icons + status link.
 *
 * Quiet — no dot grid, no accent glow line, no pulsing status dot.
 */

import Link from "next/link";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

import { Wordmark } from "@/components/brand/wordmark";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { BRAND } from "@/lib/constants";

const footerLinks: Record<string, Array<{ label: string; href: string }>> = {
  Platform: [
    { label: "Live monitor", href: "#" },
    { label: "Routing builder", href: "#" },
    { label: "Marketplace", href: "#" },
    { label: "AI insights", href: "#" },
    { label: "Numbers", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API reference", href: "#" },
    { label: "Webhooks", href: "#" },
    { label: "Changelog", href: "#" },
    { label: "Status", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Customers", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
    { label: "TCPA", href: "#" },
    { label: "HIPAA", href: "#" },
  ],
};

const SOCIALS: Array<{ icon: typeof Github; label: string; href: string }> = [
  { icon: Twitter, label: "X / Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* === Top layer === */}
        <div className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Wordmark size="sm" uid="footer" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {BRAND.description}
            </p>

            <NewsletterForm />
            <p className="mt-2 text-xs text-muted-foreground">
              Monthly. Real product news, no fluff. Unsubscribe anytime.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* === Bottom bar === */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {BRAND.name} Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
              All systems operational
            </Link>

            <ul className="flex items-center gap-1">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <Link
                      href={s.href}
                      aria-label={s.label}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
