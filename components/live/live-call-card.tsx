"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Phone, PhoneIncoming, PhoneMissed, XCircle } from "lucide-react";

import { CallWaveform } from "@/components/live/call-waveform";
import { Badge } from "@/components/ui/badge";
import { useNow } from "@/hooks/use-mock-socket";
import { formatTimer, toE164 } from "@/lib/format";
import type { Call, CallStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<CallStatus, { icon: typeof Phone; bg: string; ring: string; label: string }> = {
  ringing: { icon: PhoneIncoming, bg: "bg-accent/15 text-accent", ring: "ring-accent/40", label: "Ringing" },
  "in-progress": { icon: Phone, bg: "bg-accent/15 text-accent", ring: "ring-accent/40", label: "In progress" },
  completed: {
    icon: CheckCircle2,
    bg: "bg-[oklch(0.74_0.18_155)]/15 text-[oklch(0.6_0.18_155)] dark:text-[oklch(0.78_0.18_155)]",
    ring: "ring-[oklch(0.74_0.18_155)]/30",
    label: "Won",
  },
  missed: {
    icon: PhoneMissed,
    bg: "bg-[oklch(0.78_0.16_75)]/15 text-[oklch(0.6_0.16_75)] dark:text-[oklch(0.82_0.16_75)]",
    ring: "ring-[oklch(0.78_0.16_75)]/30",
    label: "Missed",
  },
  rejected: { icon: XCircle, bg: "bg-destructive/15 text-destructive", ring: "ring-destructive/30", label: "Rejected" },
  failed: { icon: XCircle, bg: "bg-destructive/15 text-destructive", ring: "ring-destructive/30", label: "Failed" },
};

interface LiveCallCardProps {
  call: Call;
  isLive: boolean;
}

export function LiveCallCard({ call, isLive }: LiveCallCardProps) {
  const now = useNow(1000);
  const live = isLive ? Math.max(0, Math.floor((now - call.startedAt) / 1000)) : call.durationSec;
  const meta = STATUS_META[call.status];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-3 transition-colors",
        isLive && "ring-1 ring-accent/30",
      )}
    >
      {/* Pulsing left rail for live calls */}
      {isLive && (
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-transparent via-accent to-transparent animate-vortyx-pulse" />
      )}

      <div className="flex items-center gap-3">
        <div className={cn("relative inline-flex h-10 w-10 items-center justify-center rounded-lg", meta.bg)}>
          <Icon className="h-4 w-4" />
          {isLive && (
            <span className="absolute -right-1 -top-1 inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-sm">{toE164(call.callerNumber)}</span>
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="h-2.5 w-2.5" /> {call.geo.state}
            </Badge>
            {call.publisherName && (
              <span className="hidden text-[10px] font-mono text-muted-foreground sm:inline">
                via {call.publisherName}
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">{call.campaignName}</div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            {/* In-progress calls show a full waveform; ringing shows a paused
                low-amplitude waveform as a "audio not yet established" cue. */}
            {isLive && (call.status === "in-progress" || call.status === "ringing") && (
              <CallWaveform
                size="sm"
                active={call.status === "in-progress"}
                className="text-accent"
                label={
                  call.status === "in-progress"
                    ? "Call audio active"
                    : "Call ringing, audio pending"
                }
              />
            )}
            <span className={cn("font-mono text-base font-semibold tabular-nums", isLive && "text-accent")}>
              {formatTimer(live)}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</span>
        </div>
      </div>
    </motion.div>
  );
}
