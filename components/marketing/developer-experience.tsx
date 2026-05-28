"use client";

import { Check } from "lucide-react";

const features = [
  "Real-time routing in under 150ms",
  "Per-buyer caps, concurrency, schedules",
  "Time-zone aware filters and dayparting",
  "Test caller built into every plan",
];

/* Static terminal content — no typing effect, no glow */
const TERMINAL_LINES: Array<{ text: string; tone: "prompt" | "ok" | "muted" | "info" }> = [
  { text: "$ vortyx campaigns activate health-tier-1", tone: "prompt" },
  { text: "", tone: "muted" },
  { text: "✓ Campaign live: Health Insurance — Tier 1", tone: "ok" },
  { text: "✓ 124 numbers attached · 8 buyers receiving", tone: "ok" },
  { text: "✓ Routing 312 calls/hr at $42.50 avg payout", tone: "ok" },
  { text: "", tone: "muted" },
  { text: "Streaming events ▸", tone: "info" },
];

export function DeveloperExperience() {
  return (
    <section id="developer-experience" className="border-y border-border/40 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Live, observable, in your hands
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Vortyx is built for the people running campaigns at 2am when the network&apos;s hot.
              Flip a campaign, raise a cap, tune a rule — and watch the change land instantly in
              the live monitor.
            </p>
            <ul className="mt-8 space-y-3.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15">
                    <Check className="h-3 w-3 text-accent" />
                  </span>
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <div className="flex h-9 items-center gap-2 border-b border-border/60 bg-secondary/30 px-4">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                vortyx — operations
              </span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              {TERMINAL_LINES.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.tone === "prompt"
                      ? "text-foreground"
                      : line.tone === "ok"
                        ? "text-accent"
                        : line.tone === "info"
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                  }
                >
                  {line.text || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
