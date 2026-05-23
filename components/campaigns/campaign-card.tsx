"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Hash, MoreVertical, Pause, Play, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { CampaignStatusBadge } from "./campaign-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VERTICAL_ACCENT, type Campaign } from "@/lib/types";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { makeSparkline } from "@/lib/mock/timeseries";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ACCENT_GLOW: Record<string, string> = {
  cyan: "rgba(59, 182, 255, 0.18)",
  emerald: "rgba(40, 175, 110, 0.18)",
  violet: "rgba(150, 95, 220, 0.18)",
  amber: "rgba(220, 160, 60, 0.18)",
  rose: "rgba(225, 90, 130, 0.18)",
};
const ACCENT_LINE: Record<string, string> = {
  cyan: "var(--accent)",
  emerald: "oklch(0.6 0.18 155)",
  violet: "oklch(0.6 0.2 290)",
  amber: "oklch(0.6 0.16 75)",
  rose: "oklch(0.6 0.2 10)",
};
const ACCENT_DOT: Record<string, string> = {
  cyan: "bg-accent",
  emerald: "bg-[oklch(0.6_0.18_155)]",
  violet: "bg-[oklch(0.6_0.2_290)]",
  amber: "bg-[oklch(0.6_0.16_75)]",
  rose: "bg-[oklch(0.6_0.2_10)]",
};

interface CampaignCardProps {
  campaign: Campaign;
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
  /** Stable seed so the sparkline doesn't reshuffle across renders. */
  seed: number;
}

export function CampaignCard({ campaign, onToggle, onArchive, seed }: CampaignCardProps) {
  const tone = VERTICAL_ACCENT[campaign.vertical] ?? "cyan";
  const lineColor = ACCENT_LINE[tone];
  const glow = ACCENT_GLOW[tone];
  const dot = ACCENT_DOT[tone];
  const spark = makeSparkline(seed, 12, 45, 36);
  const isActive = campaign.status === "active";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
      />

      {/* Top accent strip */}
      <div className={cn("h-0.5 w-full", dot)} />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`${ROUTES.campaigns}/${campaign.id}`}
              className="block truncate font-semibold leading-snug transition-colors hover:text-accent"
            >
              {campaign.name}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dot)} />
              <span className="font-mono">{campaign.vertical}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CampaignStatusBadge status={campaign.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 h-7 w-7 opacity-60 hover:opacity-100"
                  aria-label="Campaign actions"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onToggle(campaign.id)}>
                  {isActive ? (
                    <>
                      <Pause className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onArchive(campaign.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {campaign.description && (
          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{campaign.description}</p>
        )}

        {/* Mini stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-4 text-center">
          <div>
            <div className="font-mono text-base font-semibold">{formatCompact(campaign.callsToday)}</div>
            <div className="text-[10px] text-muted-foreground">calls today</div>
          </div>
          <div>
            <div className="font-mono text-base font-semibold">{formatCurrency(campaign.revenueToday)}</div>
            <div className="text-[10px] text-muted-foreground">revenue</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 font-mono text-base font-semibold">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              {formatPercent(campaign.conversionRate * 100, 0)}
            </div>
            <div className="text-[10px] text-muted-foreground">conversion</div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="-mx-2 mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={`spark-c-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#spark-c-${campaign.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer counts */}
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Hash className="h-3 w-3" /> {campaign.numbersCount} numbers
          </span>
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3 w-3" /> {campaign.buyersCount} buyers
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {campaign.publishersCount} pubs
          </span>
        </div>
      </div>
    </motion.div>
  );
}
