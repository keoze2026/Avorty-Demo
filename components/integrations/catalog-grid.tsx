"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";

import { AppLogo } from "./app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INTEGRATION_CATEGORIES } from "@/lib/mock/integrations";
import type { IntegrationApp, IntegrationCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  apps: IntegrationApp[];
  onConnect: (id: string) => void;
}

export function CatalogGrid({ apps, onConnect }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | IntegrationCategory>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (q && !`${a.name} ${a.description} ${a.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [apps, query, category]);

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-sans text-base font-semibold">Browse the catalog</h3>
          <p className="text-[11px] text-muted-foreground">
            {filtered.length} of {apps.length} available
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps…"
            className="h-8 w-64 pl-8 text-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </header>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-secondary/40 p-0.5">
        <Pill active={category === "all"} onClick={() => setCategory("all")}>
          All
        </Pill>
        {INTEGRATION_CATEGORIES.map((c) => (
          <Pill key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
            {c.label}
          </Pill>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02, duration: 0.22 }}
          >
            <Card className="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10">
              <CardContent className="flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <AppLogo mark={app.mark} color={app.color} size="h-11 w-11" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {app.category}
                  </span>
                </div>
                <h3 className="mt-3 truncate text-sm font-semibold">{app.name}</h3>
                <p className="mt-1 line-clamp-2 flex-1 text-[11px] text-muted-foreground">
                  {app.description}
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full justify-center"
                  onClick={() => onConnect(app.id)}
                >
                  <Plus className="h-3 w-3" /> Connect
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 rounded px-2.5 text-xs font-mono capitalize transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
