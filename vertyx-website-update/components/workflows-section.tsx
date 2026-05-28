"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowRight, Heart, Sun, Scale, Car, Home, Banknote } from "lucide-react"

const verticalCards = [
  {
    id: 1,
    category: "Health Insurance",
    stat: "$42",
    statLabel: "AVG PAYOUT / QUALIFIED CALL",
    title: "Medicare AEP, ACA, supplemental — high-intent, qualified intake.",
    icon: Heart,
    color: "emerald",
  },
  {
    id: 2,
    category: "Solar & Home Services",
    stat: "+11%",
    statLabel: "CONVERSION VS LEGACY STACKS",
    title: "Roof-owner verification, dayparting, and geo-routing built in.",
    icon: Sun,
    color: "yellow",
  },
  {
    id: 3,
    category: "Legal",
    stat: "$120",
    statLabel: "AVG PAYOUT / QUALIFIED CALL",
    title: "Mass tort intake with consent capture and per-firm caps.",
    icon: Scale,
    color: "blue",
  },
  {
    id: 4,
    category: "Auto Warranty",
    stat: "<150ms",
    statLabel: "BUYER MATCH DECISION",
    title: "Off-warranty vehicle owners, geo + tag filters, capacity-aware.",
    icon: Car,
    color: "orange",
  },
  {
    id: 5,
    category: "Mortgage & Refi",
    stat: "23",
    statLabel: "PRE-BUILT FILTERS",
    title: "Soft-pull pre-quals, debt-thresholds, FICO-aware routing.",
    icon: Home,
    color: "purple",
  },
  {
    id: 6,
    category: "Finance",
    stat: "44%",
    statLabel: "AVG CONVERSION RATE",
    title: "Debt consolidation, personal loans, tax relief — soft-pull qualifying.",
    icon: Banknote,
    color: "cyan",
  },
]

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
}

function VerticalCard({ card }: { card: typeof verticalCards[0] }) {
  const colors = colorClasses[card.color]
  const Icon = card.icon
  
  return (
    <div className="flex-shrink-0 w-[calc(25%-12px)] min-w-[280px]">
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden h-[340px] flex flex-col">
        {/* Stat area */}
        <div className="flex-1 relative overflow-hidden p-6">
          <div className={`inline-flex items-center gap-2 ${colors.bg} ${colors.border} border rounded-lg px-3 py-2 mb-4`}>
            <Icon className={`w-4 h-4 ${colors.text}`} />
            <span className={`text-2xl font-semibold ${colors.text}`}>{card.stat}</span>
          </div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">{card.statLabel}</p>
          
          {/* Fade overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(9,9,11,0.9), transparent)",
            }}
          />
        </div>

        {/* Card footer */}
        <div className="p-4 border-t border-zinc-800/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-1">{card.category}</p>
              <p className="text-sm text-zinc-200 leading-snug">{card.title}</p>
            </div>
            <button className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorkflowsSection() {
  const [scrollPosition, setScrollPosition] = useState(0)

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1))
  }

  const scrollRight = () => {
    setScrollPosition(Math.min(verticalCards.length - 4, scrollPosition + 1))
  }

  return (
    <section className="relative py-24" style={{ backgroundColor: "#09090B" }}>
      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
          <div className="lg:max-w-xl">
            {/* Orange indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm text-zinc-400">Verticals</span>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-medium text-white leading-[1.1]">
              Built for the calls
              <br />
              that pay
            </h2>
          </div>

          {/* Description */}
          <p className="text-zinc-400 lg:max-w-sm lg:pt-12">
            Every vertical Vortyx supports ships with the filters, tags, and consent capture that vertical actually needs — so you&apos;re not gluing yours together from scratch.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${scrollPosition * (100 / 4)}%)` }}
          >
            {verticalCards.map((card) => (
              <VerticalCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={scrollPosition === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={scrollPosition >= verticalCards.length - 4}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
