"use client"

import { motion } from "framer-motion"
import { ChevronRight, Plus, Phone, Zap, Scale } from "lucide-react"

const featureCards = [
  {
    title: "Real-time call routing",
    description: "142ms average decision time",
    illustration: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg p-6">
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border border-indigo-500/30 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border border-indigo-500/40 rounded-full animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
          </div>
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/50">
            <Phone className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "AI-driven optimization",
    description: "Learn and adapt automatically",
    illustration: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-2 w-24 bg-emerald-500/60 rounded-full" />
            <div className="h-2 w-16 bg-emerald-500/40 rounded-full" />
            <div className="h-2 w-20 bg-emerald-500/20 rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Compliance built-in",
    description: "TCPA, HIPAA, SOC 2 ready",
    illustration: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <Scale className="w-7 h-7 text-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-medium">TCPA</span>
            <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-[10px] font-medium">HIPAA</span>
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">SOC 2</span>
          </div>
        </div>
      </div>
    ),
  },
]

export function FeatureCardsSection() {
  return (
    <div className="relative z-20 py-40" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Header row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white max-w-md"
              style={{
                letterSpacing: "-0.0325em",
                fontVariationSettings: '"opsz" 28',
                fontWeight: 538,
                lineHeight: 1.1,
              }}
            >
              Built for modern pay-per-call
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md"
            >
              <p className="text-zinc-400 leading-relaxed">
                Avortyx replaces a stack of legacy call-tracking tools with a single, real-time control plane — from inbound ring to buyer settlement.{" "}
                <a href="#" className="text-white inline-flex items-center gap-1 hover:underline">
                  Learn more <ChevronRight className="w-4 h-4" />
                </a>
              </p>
            </motion.div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group overflow-hidden relative flex flex-col justify-end"
                style={{
                  aspectRatio: "336 / 360",
                  borderRadius: "30px",
                  height: "360px",
                  isolation: "isolate",
                }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                  style={{
                    maskImage: "linear-gradient(#000 70%, transparent 90%)",
                    WebkitMaskImage: "linear-gradient(#000 70%, transparent 90%)",
                  }}
                >
                  {card.illustration}
                </div>
                <div
                  className="relative z-10 flex items-center justify-between w-full"
                  style={{ padding: "0 24px 40px", gap: "16px" }}
                >
                  <div>
                    <h3 className="text-white font-medium text-lg leading-tight">{card.title}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{card.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
