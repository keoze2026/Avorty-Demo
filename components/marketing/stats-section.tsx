"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "142ms", label: "Average routing decision" },
  { value: "1.2B+", label: "Calls routed yearly across our network" },
  { value: "97.4%", label: "Average buyer match rate" },
  { value: "12+", label: "Verticals supported out of the box" },
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-card/30">
      {/* Subtle accent line at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--vortyx-mid) 20%, var(--vortyx-bright) 50%, var(--vortyx-mid) 80%, transparent)",
          opacity: 0.4,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              <p
                className="font-mono text-5xl font-bold tracking-tight"
                style={{
                  background: "linear-gradient(180deg, var(--foreground) 30%, var(--accent) 130%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
