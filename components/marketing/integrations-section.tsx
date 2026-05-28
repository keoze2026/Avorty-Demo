"use client";

/**
 * Integrations logo cloud — clean wordmark grid.
 */

import { motion } from "framer-motion";

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
    <section className="border-y border-border/40 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Plays well with your stack.
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Every event lands on your webhook within milliseconds. Pre-built connectors to the
            tools you already pay for.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-3 lg:grid-cols-4">
          {INTEGRATIONS.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.025, duration: 0.3 }}
              className="flex h-24 items-center justify-center bg-card text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
            >
              {name}
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
