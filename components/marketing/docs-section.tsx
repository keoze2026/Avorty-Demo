import {
  Book,
  Building2,
  FileText,
  GitFork,
  Hash,
  Plug,
  Shield,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";

const docCategories = [
  {
    icon: Sparkles,
    title: "Getting started",
    description: "From signup to your first live campaign in under 15 minutes.",
    links: ["Quickstart", "Concepts", "First campaign"],
  },
  {
    icon: GitFork,
    title: "Routing concepts",
    description: "Ring trees, filters, splits, caps, fallbacks — the building blocks.",
    links: ["Ring trees", "Filters & caps", "Weighted splits"],
  },
  {
    icon: Hash,
    title: "Numbers & pools",
    description: "Provision DIDs, organize them into pools, rotate them on a strategy.",
    links: ["Provisioning", "Pool strategies", "Geo routing"],
  },
  {
    icon: Building2,
    title: "Buyers & publishers",
    description: "Invite partners, configure bids, set caps, audit performance.",
    links: ["Buyer setup", "Publisher payouts", "Caps & pacing"],
  },
  {
    icon: TerminalSquare,
    title: "API reference",
    description: "Typed SDK, REST routes, and the webhook event catalog.",
    links: ["SDK", "REST API", "Webhooks"],
  },
  {
    icon: Plug,
    title: "Integrations",
    description: "Salesforce, HubSpot, GHL, Twilio, postbacks — pre-built and well-tested.",
    links: ["CRM postbacks", "Data exports", "BYO carrier"],
  },
  {
    icon: Shield,
    title: "Security & compliance",
    description: "TCPA, HIPAA, SOC 2 — the controls and disclosures auditors ask about.",
    links: ["TCPA toolkit", "HIPAA tier", "Audit logs"],
  },
];

export function DocsSection() {
  return (
    <section id="docs" className="py-24 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent">
            <Book className="h-4 w-4" />
            <span className="font-mono uppercase tracking-wider">Documentation</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            Built for people learning the network
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every concept, knob, and webhook — explained with examples that run.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docCategories.map((category, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-border/60 bg-[#111827] p-6 transition-all duration-300 hover:border-accent/40 hover:bg-[#1F2937] hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <category.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-mono font-semibold">{category.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
              <ul className="mt-4 space-y-2">
                {category.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      <FileText className="h-3 w-3" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="#" className="inline-flex items-center gap-2 font-mono text-sm text-accent hover:underline">
            Read the full docs
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
