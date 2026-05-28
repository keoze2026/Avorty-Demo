"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "142ms", label: "Average routing decision" },
  { value: "1.2B+", label: "Calls routed yearly" },
  { value: "97.4%", label: "Average buyer match rate" },
  { value: "12+", label: "Verticals supported" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.06, duration: 0.45, ease: "easeOut" }}
              className="text-center"
            >
              <p className="text-3xl font-medium tracking-tight tabular-nums text-foreground sm:text-4xl">
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
