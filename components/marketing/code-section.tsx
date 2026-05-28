"use client";

import { useState } from "react";

const codeExamples = {
  webhook: `// Receive every call event in real time
POST /api/vortyx/events
{
  "type": "call.completed",
  "id": "call_94ab2",
  "campaign": "health-tier-1",
  "buyer": "apex-insurance",
  "durationSec": 213,
  "payout": 42.50,
  "geo": { "state": "TX", "city": "Austin" }
}

✓ Delivered in 38ms`,

  sdk: `import { createClient } from '@vortyx/sdk'

const vortyx = createClient({
  apiKey: process.env.VORTYX_API_KEY!,
  workspace: 'tier-one-health',
})

// Route an inbound call to the best buyer
const decision = await vortyx.route({
  callerNumber: '+1 (512) 555-0184',
  campaign: 'health-tier-1',
  tags: { source: 'facebook' }
})`,

  routing: `// Programmatic plan creation
await vortyx.plans.create({
  name: 'Health Q3 push',
  campaign: 'c_health_001',
  nodes: [
    { kind: 'inbound' },
    { kind: 'hoursFilter', days: [1,2,3,4,5], start: 8, end: 20 },
    { kind: 'geoFilter', mode: 'allow', states: ['TX','CA','FL'] },
    { kind: 'priority', primary: 'b_apex', fallback: 'b_solar' },
  ]
})

✓ Plan published as v3 — live in 142ms`,

  reporting: `// Query call records by anything
const rows = await vortyx.calls.list({
  status: 'completed',
  campaign: 'health-tier-1',
  since: '24h',
  groupBy: ['publisher', 'geo.state']
})

// Export to your warehouse
await vortyx.exports.create({
  destination: 'snowflake',
  cron: '*/15 * * * *'
})`,
};

const features = [
  { key: "webhook", label: "Webhooks · real-time events" },
  { key: "sdk", label: "TypeScript SDK" },
  { key: "routing", label: "Routing API" },
  { key: "reporting", label: "Reporting & exports" },
] as const;

export function CodeSection() {
  const [activeFeature, setActiveFeature] = useState<keyof typeof codeExamples>("webhook");
  const code = codeExamples[activeFeature];

  return (
    <section id="built-for-react" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            One API, everything streamable
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Every Vortyx capability is reachable from a single typed SDK — and every event lands
            on your webhook within milliseconds of happening.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="flex flex-col-reverse gap-6 md:flex-row md:gap-6">
            <div className="flex flex-col gap-2 md:w-56">
              {features.map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => setActiveFeature(feature.key)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeFeature === feature.key
                      ? "bg-accent/12 text-accent"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  }`}
                >
                  {feature.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-border/60 bg-card">
              <div className="flex h-9 items-center gap-2 border-b border-border/60 bg-secondary/30 px-4">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  terminal · vortyx-cli
                </span>
              </div>
              <pre className="h-[300px] overflow-auto p-5">
                <code className="font-mono text-sm leading-relaxed">
                  {code.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line.startsWith("//") ? (
                        <span className="text-muted-foreground/60">{line}</span>
                      ) : line.startsWith("$") ||
                        line.startsWith("POST") ||
                        line.startsWith("GET") ? (
                        <span className="text-accent">{line}</span>
                      ) : line.startsWith("✓") ? (
                        <span className="text-accent">{line}</span>
                      ) : (
                        <span className="text-foreground/85">{line || " "}</span>
                      )}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
