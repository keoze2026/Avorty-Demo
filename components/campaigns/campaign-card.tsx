"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Hash,
  MoreVertical,
  Pause,
  Play,
  TrendingUp,
  Users,
} from "lucide-react";
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
  cyan: "rgba(59, 182, 255, 0.22)",
  emerald: "rgba(40, 175, 110, 0.22)",
  violet: "rgba(150, 95, 220, 0.22)",
  amber: "rgba(220, 160, 60, 0.22)",
  rose: "rgba(225, 90, 130, 0.22)",
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
const ACCENT_TEXT: Record<string, string> = {
  cyan: "text-accent",
  emerald: "text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
  violet: "text-[oklch(0.55_0.2_290)] dark:text-[oklch(0.72_0.2_290)]",
  amber: "text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
  rose: "text-[oklch(0.6_0.2_10)] dark:text-[oklch(0.78_0.2_10)]",
};
const ACCENT_BORDER: Record<string, string> = {
  cyan: "border-accent/45",
  emerald: "border-[oklch(0.6_0.18_155)]/45",
  violet: "border-[oklch(0.6_0.2_290)]/45",
  amber: "border-[oklch(0.6_0.16_75)]/45",
  rose: "border-[oklch(0.6_0.2_10)]/45",
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
  const text = ACCENT_TEXT[tone];
  const bracketBorder = ACCENT_BORDER[tone];
  const spark = makeSparkline(seed, 12, 45, 36);
  const isActive = campaign.status === "active";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card"
    >
      {/* Ambient glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
      />

      {/* Corner brackets — toned with the vertical */}
      <CornerBracket position="tl" className={bracketBorder} />
      <CornerBracket position="tr" className={bracketBorder} />
      <CornerBracket position="bl" className={bracketBorder} />
      <CornerBracket position="br" className={bracketBorder} />

      {/* Top accent rule */}
      <div className="relative h-px w-full">
        <span
          aria-hidden
          className={cn("absolute left-6 right-6 top-0 h-px", "bg-gradient-to-r from-transparent via-current to-transparent", text)}
        />
      </div>

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dot)} />
              {campaign.vertical}
              <span aria-hidden>·</span>
              <span className="opacity-70">{campaign.id.slice(-6)}</span>
            </div>
            <Link
              href={`${ROUTES.campaigns}/${campaign.id}`}
              className="mt-1.5 flex items-center gap-1 truncate text-base font-semibold leading-snug transition-colors hover:text-accent"
            >
              <span className="truncate">{campaign.name}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
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

        {/* Payout band */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              payout
            </div>
            <div className="font-mono text-base font-semibold tabular-nums">
              {formatCurrency(campaign.payout, true)}
              <span className="ml-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                / {campaign.payoutModel.replace("per-", "")}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              daily cap
            </div>
            <div className="font-mono text-base font-semibold tabular-nums">
              {campaign.dailyCap === 0 ? "∞" : formatCompact(campaign.dailyCap)}
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini label="calls" value={formatCompact(campaign.callsToday)} />
          <Mini
            label="revenue"
            value={formatCurrency(campaign.revenueToday)}
            valueClass={text}
          />
          <Mini
            label="conv"
            value={formatPercent(campaign.conversionRate * 100, 0)}
            icon={<TrendingUp className={cn("h-3 w-3", text)} />}
          />
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
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Hash className="h-3 w-3" /> {campaign.numbersCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3 w-3" /> {campaign.buyersCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {campaign.publishersCount}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Mini({
  label,
  value,
  valueClass,
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-secondary/20 py-2">
      <div
        className={cn(
          "flex items-center justify-center gap-1 font-mono text-sm font-semibold tabular-nums",
          valueClass,
        )}
      >
        {icon}
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function CornerBracket({
  position,
  className,
}: {
  position: "tl" | "tr" | "bl" | "br";
  className?: string;
}) {
  const map: Record<typeof position, string> = {
    tl: "top-0 left-0 border-t-[1.5px] border-l-[1.5px] rounded-tl-xl",
    tr: "top-0 right-0 border-t-[1.5px] border-r-[1.5px] rounded-tr-xl",
    bl: "bottom-0 left-0 border-b-[1.5px] border-l-[1.5px] rounded-bl-xl",
    br: "bottom-0 right-0 border-b-[1.5px] border-r-[1.5px] rounded-br-xl",
  };
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute h-3 w-3", map[position], className)}
    />
  );
}
