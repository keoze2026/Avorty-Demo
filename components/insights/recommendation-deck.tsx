"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Filter, Sparkles } from "lucide-react";

import { RecommendationCard } from "./recommendation-card";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock/insights";
import type { AiRecommendation, RecommendationKind, RecommendationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | RecommendationKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "scale", label: "Scale" },
  { id: "pause", label: "Pause" },
  { id: "rebalance", label: "Rebalance" },
  { id: "alert", label: "Alert" },
  { id: "optimize", label: "Optimize" },
];

export function RecommendationDeck() {
  const [recs, setRecs] = useState<AiRecommendation[]>(MOCK_RECOMMENDATIONS);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const open = recs.filter((r) => r.status === "open");
  const visible = useMemo(() => {
    if (filter === "all") return open;
    return open.filter((r) => r.kind === filter);
  }, [open, filter]);

  const onAction = (id: string, status: RecommendationStatus) => {
    setRecs((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Recommendations</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
            <Sparkles className="h-3 w-3" />
            {open.length} open
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
          <Filter className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-7 rounded px-2 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-secondary/30 p-10 text-center">
          <CheckCircle2 className="h-6 w-6 text-[color:var(--success)]" />
          <p className="text-sm font-medium">All caught up.</p>
          <p className="text-xs text-muted-foreground">
            No open recommendations in this filter. The co-pilot is still watching.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnimatePresence>
            {visible.map((r) => (
              <motion.div
                key={r.id}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <RecommendationCard recommendation={r} onAction={onAction} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
