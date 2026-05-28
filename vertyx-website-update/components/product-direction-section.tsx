"use client"

import { ChevronRight, Phone, Activity, BarChart3, Users } from "lucide-react"

export function ProductDirectionSection() {
  return (
    <section className="relative py-40 px-6 md:px-12 lg:px-24">
      {/* Gradient overlay at top */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-zinc-400 text-sm">How it works</span>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </div>

        {/* Section heading */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium text-white mb-8 max-w-3xl"
          style={{
            letterSpacing: "-0.0325em",
            fontVariationSettings: '"opsz" 28',
            fontWeight: 538,
            lineHeight: 1.1,
          }}
        >
          Live in your network by lunch.
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-lg max-w-md mb-16">
          <span className="text-white font-medium">Four steps from &quot;we just signed&quot; to &quot;calls are routing.&quot;</span> No deployment, no implementation team.
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
          {/* Left column - Live monitoring */}
          <div className="border-t border-r border-b border-zinc-800 pt-10 pr-10 pb-16">
            <h3 className="text-xl font-medium text-zinc-200 mb-3">Visual routing builder</h3>
            <p className="text-zinc-500 text-base leading-relaxed mb-8">
              Drag-and-drop ring trees with conditional filters, weighted splits, caps, and fallbacks.
            </p>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h4 className="text-lg font-medium text-zinc-200 mb-5">Ring Tree Editor</h4>

              {/* Properties row */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-zinc-500 text-sm w-20">Campaign</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Health Tier 1
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                    Live
                  </span>
                </div>
              </div>

              {/* Filters row */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-zinc-500 text-sm w-20">Filters</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                    State: TX, FL, CA
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-xs">
                    Age 65+
                  </span>
                </div>
              </div>

              {/* Buyers row */}
              <div className="flex items-start gap-4">
                <span className="text-zinc-500 text-sm w-20 pt-1">Buyers</span>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-zinc-300 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Apex Insurance <span className="text-zinc-500">50%</span>
                  </span>
                  <span className="flex items-center gap-2 text-zinc-300 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    HealthDirect <span className="text-zinc-500">30%</span>
                  </span>
                  <span className="flex items-center gap-2 text-zinc-400 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full border border-zinc-500 bg-transparent" />
                    Fallback Pool <span className="text-zinc-500">20%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Real-time analytics */}
          <div className="border-t border-b border-zinc-800 pt-10 pl-10 pb-16">
            <h3 className="text-xl font-medium text-zinc-200 mb-3">Sub-second analytics</h3>
            <p className="text-zinc-500 text-base leading-relaxed mb-8">
              Filter call-detail records by hour, geo, publisher, buyer, or tag — and drill all the way down.
            </p>

            <div className="relative h-48">
              {/* Back card */}
              <div
                className="absolute rounded-lg bg-zinc-800/40 border border-zinc-700/30 px-4 py-2"
                style={{ top: 0, left: "10%", width: "80%" }}
              >
                <span className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Yesterday
                </span>
              </div>

              {/* Middle card */}
              <div
                className="absolute rounded-lg bg-zinc-800/60 border border-zinc-700/40 px-4 py-2"
                style={{ top: "30px", left: "5%", width: "85%" }}
              >
                <span className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  Last hour
                </span>
              </div>

              {/* Front card - Live */}
              <div
                className="absolute rounded-xl bg-zinc-800/90 border border-zinc-700/50 px-5 py-4"
                style={{ top: "60px", left: 0, width: "95%" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </span>
                  <span className="text-emerald-500 font-medium text-sm">Live</span>
                </div>
                <p className="text-zinc-300 text-sm mb-3">312 calls in flight · $24.3K revenue today</p>
                <span className="text-zinc-500 text-xs">Updated 2 seconds ago</span>
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
  )
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-zinc-400" />
        </div>
        <span className="text-zinc-600 text-sm font-mono">{number}</span>
      </div>
      <h3 className="text-zinc-200 font-medium text-lg mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold text-white mb-2">{value}</div>
      <div className="text-zinc-500 text-sm">{label}</div>
    </div>
  )
}
