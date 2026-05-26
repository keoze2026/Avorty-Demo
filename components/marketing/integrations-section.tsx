"use client";

/**
 * Integrations logo cloud — clean wordmark grid.
 * Uses neutral text-only logos for a premium "trusted-by" look that
 * doesn't depend on hosting real third-party SVG assets.
 */

import { motion } from "framer-motion";
import { Plug } from "lucide-react";

const INTEGRATIONS = [
  "Twilio",
  "HubSpot",
  "Salesforce",
  "Zapier",
  "Segment",
  "Snowflake",
  "Slack",
  "Stripe",
  "PostgreSQL",
  "BigQuery",
  "Bandwidth",
  "GoHighLevel",
];

export function IntegrationsSection() {
  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-card/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground backdrop-blur">
            <Plug className="h-3 w-3 text-accent" />
            Integrations
          </span>
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Plays well with your stack.
          </h2>
          <p className="mt-3 text-balance text-base text-muted-foreground">
            Every event lands on your webhook within milliseconds. Pre-built connectors to the tools
            you already pay for.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-3 lg:grid-cols-4">
          {INTEGRATIONS.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="group relative flex h-24 items-center justify-center bg-card transition-colors hover:bg-secondary/40"
            >
              <span className="font-mono text-base font-medium text-muted-foreground/70 transition-colors group-hover:text-foreground">
                {name}
              </span>
              {/* Accent dot on hover, top-right corner */}
              <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Plus REST API, webhooks, and a typed TypeScript SDK — extend Vortyx in any direction.
        </p>
      </div>
    </section>
  );
}
