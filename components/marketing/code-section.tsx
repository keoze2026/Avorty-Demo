"use client";

import { useEffect, useState } from "react";
import { Blocks } from "lucide-react";

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
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const fullText = codeExamples[activeFeature];
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const id = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(id);
        setIsTyping(false);
      }
    }, 6);
    return () => clearInterval(id);
  }, [activeFeature]);

  return (
    <section id="built-for-react" className="py-24 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="flex items-center justify-center gap-2">
            <Blocks className="h-4 w-4 text-accent" />
            <p className="text-sm font-medium uppercase tracking-wider text-accent font-mono">
              Built for your stack
            </p>
          </div>
          <h2 className="mt-2 font-mono text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            One API, everything streamable
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every Vortyx capability is reachable from a single typed SDK — and every event lands on your webhook
            within milliseconds of happening.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="flex flex-col-reverse md:flex-row md:gap-8">
            <div className="mt-8 md:mt-0 md:w-56 flex flex-col gap-3">
              {features.map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => setActiveFeature(feature.key)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                    activeFeature === feature.key
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border/60 bg-card/50 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                  }`}
                >
                  {feature.label}
                </button>
              ))}
            </div>

            <div
              className="flex-1 overflow-hidden rounded-2xl border border-border/60"
              style={{ backgroundColor: "#111827" }}
            >
              <div
                className="flex h-10 items-center gap-2 border-b border-border/60 px-4"
                style={{ backgroundColor: "#1F2937" }}
              >
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">terminal · vortyx-cli</span>
              </div>
              <pre
                className="overflow-x-auto overflow-y-auto p-6 h-[300px]"
                style={{ backgroundColor: "#0A0F1C" }}
              >
                <code className="font-mono text-sm text-muted-foreground">
                  {displayedText.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line.startsWith("//") ? (
                        <span className="text-muted-foreground/60">{line}</span>
                      ) : line.startsWith("$") || line.startsWith("POST") || line.startsWith("GET") ? (
                        <span className="text-accent">{line}</span>
                      ) : line.startsWith("✓") ? (
                        <span className="text-green-400">{line}</span>
                      ) : line.match(/^\s+"[^"]+":/) ? (
                        <span className="text-foreground">{line}</span>
                      ) : line.includes("await") || line.includes("async") ? (
                        <span className="text-amber-300">{line}</span>
                      ) : line.includes("import") || line.includes("const") ? (
                        <span className="text-purple-300">{line}</span>
                      ) : (
                        <span className="text-foreground/80">{line}</span>
                      )}
                    </span>
                  ))}
                  {isTyping && <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5 align-middle" />}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
