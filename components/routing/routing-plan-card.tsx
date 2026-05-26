"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, GitFork, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { useRoutingStore } from "@/lib/store/routing-store";
import type { RoutingPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<RoutingPlan["status"], string> = {
  draft: "bg-secondary/70 text-muted-foreground",
  published: "bg-[oklch(0.74_0.18_155)]/15 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
  archived: "bg-secondary/40 text-muted-foreground/70",
};

export function RoutingPlanCard({ plan }: { plan: RoutingPlan }) {
  const setStatus = useRoutingStore((s) => s.setStatus);
  const remove = useRoutingStore((s) => s.remove);

  const published = plan.status === "published";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "rgba(59, 182, 255, 0.18)" }}
      />

      <div className="relative flex items-start gap-3 p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <GitFork className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`${ROUTES.routing}/${plan.id}`}
              className="block truncate text-sm font-semibold leading-snug transition-colors hover:text-accent"
            >
              {plan.name}
            </Link>
            <Badge className={cn("border-transparent", STATUS_TONE[plan.status])}>
              {published && (
                <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              )}
              {plan.status}
            </Badge>
          </div>
          {plan.campaignName && (
            <Link
              href={`${ROUTES.campaigns}/${plan.campaignId}`}
              className="truncate text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {plan.campaignName}
            </Link>
          )}
          {plan.description && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{plan.description}</p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-3 text-center">
            <div>
              <div className="font-mono text-base font-semibold">{plan.nodes.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">nodes</div>
            </div>
            <div>
              <div className="font-mono text-base font-semibold">{plan.edges.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">edges</div>
            </div>
            <div>
              <div className="font-mono text-base font-semibold">
                {plan.nodes.filter((n) => n.type === "buyer").length}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">buyers</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
            <span className="text-[10px] font-mono text-muted-foreground">
              Updated {formatRelativeTime(plan.updatedAt)}
            </span>
            <div className="flex items-center gap-1">
              <Link href={`${ROUTES.routing}/${plan.id}`}>
                <Button size="sm" variant="outline" className="h-7">
                  Open <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      const next = published ? "draft" : "published";
                      setStatus(plan.id, next);
                      toast.success(next === "published" ? `${plan.name} published` : `${plan.name} unpublished`);
                    }}
                  >
                    {published ? "Unpublish" : "Publish"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => {
                      remove(plan.id);
                      toast.success(`${plan.name} deleted`);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
