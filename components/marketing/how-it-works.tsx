"use client";

import { Activity, BarChart3, ChevronRight, Phone, Users } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-40 px-6 md:px-12 lg:px-24">
      {/* Gradient overlay at top */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "20%",
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 5%, transparent), transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-[color:var(--success)]" />
          <span className="text-muted-foreground text-sm">How it works</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Section heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-8 max-w-3xl leading-[1.1] tracking-tight">
          Live in your network by lunch.
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-lg max-w-md mb-16">
          <span className="text-foreground font-medium">
            Four steps from &quot;we just signed&quot; to &quot;calls are routing.&quot;
          </span>{" "}
          No deployment, no implementation team.
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StepCard
            number="01"
            icon={Phone}
            title="Provision numbers"
            description="Spin up local or toll-free DIDs in bulk. Organize them into pools with rotation rules."
          />
          <StepCard
            number="02"
            icon={Activity}
            title="Build your routing"
            description="Drag-and-drop ring trees with filters, splits, caps, and fallbacks. No tickets, no waiting."
          />
          <StepCard
            number="03"
            icon={Users}
            title="Connect buyers"
            description="Invite buyers and publishers. Set bids, caps, and concurrency from a single screen."
          />
          <StepCard
            number="04"
            icon={BarChart3}
            title="Watch it run live"
            description="Every call, every decision, every dollar — observable on a single real-time dashboard."
          />
        </div>

        {/* Bottom two-column section */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left column — Visual routing builder */}
          <div className="border-t border-r border-b border-border pt-10 pr-10 pb-16">
            <h3 className="text-xl font-medium text-foreground/90 mb-3">Visual routing builder</h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Drag-and-drop ring trees with conditional filters, weighted splits, caps, and
              fallbacks.
            </p>

            <div className="rounded-xl border border-border bg-card/50 p-5">
              <h4 className="text-lg font-medium text-foreground/90 mb-5">Ring Tree Editor</h4>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-muted-foreground text-sm w-20">Campaign</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-foreground/85 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[color:var(--success)]" />
                    Health Tier 1
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-foreground/85 text-xs">
                    Live
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-muted-foreground text-sm w-20">Filters</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-foreground/85 text-xs">
                    State: TX, FL, CA
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary text-muted-foreground text-xs">
                    Age 65+
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-muted-foreground text-sm w-20 pt-1">Buyers</span>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-foreground/85 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-[color:var(--success)]" />
                    Apex Insurance <span className="text-muted-foreground">50%</span>
                  </span>
                  <span className="flex items-center gap-2 text-foreground/85 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    HealthDirect <span className="text-muted-foreground">30%</span>
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground bg-transparent" />
                    Fallback Pool <span className="text-muted-foreground">20%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Real-time analytics */}
          <div className="border-t border-b border-border pt-10 pl-10 pb-16">
            <h3 className="text-xl font-medium text-foreground/90 mb-3">Sub-second analytics</h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Filter call-detail records by hour, geo, publisher, buyer, or tag — and drill all the
              way down.
            </p>

            <div className="relative h-48">
              <div
                className="absolute rounded-lg bg-secondary/40 border border-border/40 px-4 py-2"
                style={{ top: 0, left: "10%", width: "80%" }}
              >
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Yesterday
                </span>
              </div>

              <div
                className="absolute rounded-lg bg-secondary/60 border border-border/50 px-4 py-2"
                style={{ top: "30px", left: "5%", width: "85%" }}
              >
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Last hour
                </span>
              </div>

              <div
                className="absolute rounded-xl bg-secondary/90 border border-border/60 px-5 py-4"
                style={{ top: "60px", left: 0, width: "95%" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[color:var(--success)]/20 flex items-center justify-center">
                    <span className="w-2 h-2 bg-[color:var(--success)] rounded-full animate-pulse" />
                  </span>
                  <span className="text-[color:var(--success)] font-medium text-sm">Live</span>
                </div>
                <p className="text-foreground/85 text-sm mb-3">
                  312 calls in flight · $24.3K revenue today
                </p>
                <span className="text-muted-foreground text-xs">Updated 2 seconds ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
          <StatItem value="142ms" label="Average routing decision" />
          <StatItem value="1.2B+" label="Calls routed yearly" />
          <StatItem value="97.4%" label="Buyer match rate" />
          <StatItem value="12+" label="Verticals supported" />
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm font-mono">{number}</span>
      </div>
      <h3 className="text-foreground/90 font-medium text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold text-foreground mb-2">{value}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
