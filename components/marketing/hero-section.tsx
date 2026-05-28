import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

/**
 * Hero — single weighty composition, no motion gimmicks.
 *
 *   ┌────────────────────────────────────────────────────┐
 *   │              [ ✦ tiny status pill ]                │
 *   │                                                    │
 *   │      Modern call routing & revenue platform        │
 *   │                                                    │
 *   │   Real-time routing, live monitoring, and AI-      │
 *   │   driven optimization — all with one tool.         │
 *   │                                                    │
 *   │     [ Start free ]    [ Watch demo ]               │
 *   │                                                    │
 *   │   ─────  Dashboard | Live | Reports | Market ──── │
 *   │   ┌────────────────────────────────────────┐       │
 *   │   │            Product screenshot          │       │
 *   │   └────────────────────────────────────────┘       │
 *   └────────────────────────────────────────────────────┘
 *
 * Typography is the load-bearing element. Background is a faint static grid
 * masked to a radial gradient — no canvas, no dot trails, no typing effect.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24">
      {/* Static grid background, masked to fade at the edges */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_110%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Status pill */}
          <Link
            href={ROUTES.signup}
            className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md transition-colors hover:border-accent/50 hover:text-foreground"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span>500+ networks routing live on Vortyx</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Headline — single foreground color, medium weight, balanced */}
          <h1 className="mt-8 text-balance text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Modern call routing & revenue platform
          </h1>

          {/* Subhead */}
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Real-time routing, live monitoring, and AI-driven optimization —
            built for the modern pay-per-call network.
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={ROUTES.signup} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-10 w-full px-5 text-sm font-medium sm:w-auto"
              >
                Get started — free
              </Button>
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-10 w-full px-5 text-sm font-normal sm:w-auto"
              >
                Get a demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Product preview — a single clean dashboard frame, no SDK cycler */}
        <div className="relative mt-20">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

const PRODUCT_TABS = [
  "Dashboard",
  "Live Monitor",
  "Reports",
  "Marketplace",
  "AI Insights",
] as const;

function ProductPreview() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Quiet section tabs above the screenshot */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {PRODUCT_TABS.map((tab, i) => (
          <span
            key={tab}
            className={
              i === 0
                ? "font-medium text-foreground"
                : "transition-colors hover:text-foreground"
            }
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Frame — looks like a clean window of the actual app */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-sm">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="text-xs text-muted-foreground">app.vortyx.io / dashboard</span>
          <span className="h-2.5 w-12" />
        </div>

        {/* Dashboard mock — three quiet panels, no rainbow */}
        <div className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-3">
          <PreviewKpi label="Calls today" value="1,002" hint="peak 81 · avg 42" />
          <PreviewKpi label="Revenue" value="$13,401" hint="+8.7% vs yesterday" />
          <PreviewKpi label="Conversion" value="84.6%" hint="across 14 campaigns" />
        </div>

        {/* Mock bar chart — single accent, soft fade, no clutter */}
        <div className="border-t border-border/60 p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h3 className="text-sm font-semibold">Calls today</h3>
              <p className="text-xs text-muted-foreground">
                Hourly distribution, all destinations
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>

          <div className="flex h-48 items-end justify-between gap-1">
            {SAMPLE_BARS.map((h, i) => (
              <span
                key={i}
                className="block w-full rounded-t-sm bg-accent"
                style={{ height: `${h}%`, opacity: 0.4 + h / 200 }}
              />
            ))}
          </div>

          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </div>
      </div>

      {/* Soft glow below the frame for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 -bottom-6 h-12 rounded-full bg-accent/15 blur-3xl"
      />
    </div>
  );
}

function PreviewKpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-card px-6 py-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-2xl font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

/** Static sample for the preview bar chart — same shape as a real day curve. */
const SAMPLE_BARS = [
  12, 14, 18, 26, 38, 48, 56, 66, 74, 78, 82, 88, 78, 70, 64, 58, 50, 44, 36, 30, 24, 20, 16, 14,
];
