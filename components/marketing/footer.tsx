/**
 * Marketing footer — two-layer.
 *
 * Top layer: brand block + 4 link columns + email signup.
 * Bottom bar: copyright + social icons + status pill.
 *
 * Subtle dotted grid background fades from accent glow on top.
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
    <footer className="relative overflow-hidden border-t border-border/60 bg-card/40">
      {/* Subtle dot grid background that fades out */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%)",
        }}
      />
      {/* Accent glow along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--accent) 20%, color-mix(in oklab, var(--vortyx-cyan) 70%, transparent) 60%, transparent)",
          opacity: 0.5,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* === Top layer === */}
        <div className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Wordmark size="md" uid="footer" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">{BRAND.description}</p>

            <NewsletterForm />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Monthly. Real product news, no fluff. Unsubscribe anytime.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  {title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center text-sm text-foreground/80 transition-colors hover:text-accent"
                      >
                        {link.label}
                        <span
                          aria-hidden
                          className="ml-1 inline-block h-px w-0 bg-current transition-all duration-200 group-hover:w-3"
                        />
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
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground backdrop-blur hover:text-foreground"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
              </span>
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
                      className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-card/40 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/10 hover:text-accent hover:shadow-md hover:shadow-accent/20"
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
