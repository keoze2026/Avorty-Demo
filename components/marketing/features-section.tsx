"use client";

import { motion } from "framer-motion";
import { ChevronRight, Phone, Plus, Scale, Zap } from "lucide-react";

const featureCards = [
  {
    title: "Real-time call routing",
    description: "142ms average decision time",
    illustration: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg p-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-32 h-32 border border-accent/30 rounded-full animate-ping"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-24 h-24 border border-accent/40 rounded-full animate-ping"
              style={{ animationDuration: "2s", animationDelay: "0.5s" }}
            />
          </div>
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center border border-accent/50">
            <Phone className="w-8 h-8 text-accent" />
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
          <div className="w-12 h-12 rounded-lg bg-[color:var(--success)]/20 border border-[color:var(--success)]/40 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[color:var(--success)]" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-2 w-24 bg-[color:var(--success)]/60 rounded-full" />
            <div className="h-2 w-16 bg-[color:var(--success)]/40 rounded-full" />
            <div className="h-2 w-20 bg-[color:var(--success)]/20 rounded-full" />
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
          <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
            <Scale className="w-7 h-7 text-accent" />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-accent/20 text-accent text-[10px] font-medium">
              TCPA
            </span>
            <span className="px-2 py-1 rounded bg-accent/20 text-accent text-[10px] font-medium">
              HIPAA
            </span>
            <span className="px-2 py-1 rounded bg-[color:var(--success)]/20 text-[color:var(--success)] text-[10px] font-medium">
              SOC 2
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <div id="features" className="relative z-20 py-40">
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 5%, transparent) 0%, transparent 100%)",
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
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground max-w-md font-medium leading-[1.1] tracking-tight"
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
              <p className="text-muted-foreground leading-relaxed">
                Vortyx replaces a stack of legacy call-tracking tools with a single, real-time
                control plane — from inbound ring to buyer settlement.{" "}
                <a
                  href="#"
                  className="text-foreground inline-flex items-center gap-1 hover:underline"
                >
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
                className="bg-card/50 border border-border hover:border-border/80 transition-colors cursor-pointer group overflow-hidden relative flex flex-col justify-end"
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
                    <h3 className="text-foreground font-medium text-lg leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{card.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-muted-foreground group-hover:text-foreground/85 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
