"use client";

/**
 * Countdown to a unix-ms timestamp. Shows mm:ss, switches to red+pulse
 * inside the last 10 seconds. Updates every 250ms for smooth feel.
 */

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  endsAt: number;
  className?: string;
  /** "lg" = bold readout for the featured auction */
  variant?: "default" | "lg";
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00";
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function CountdownTimer({ endsAt, className, variant = "default" }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let last = 0;
    const step = (t: number) => {
      if (t - last >= 250) {
        last = t;
        setNow(Date.now());
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const remaining = endsAt - now;
  const urgent = remaining > 0 && remaining < 10_000;
  const ended = remaining <= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono tabular-nums transition-colors",
        variant === "lg" ? "text-2xl font-semibold" : "text-xs",
        ended ? "text-muted-foreground" : urgent ? "text-destructive" : "text-foreground",
        urgent && "animate-pulse",
        className,
      )}
    >
      <Clock className={variant === "lg" ? "h-4 w-4" : "h-3 w-3"} />
      {formatRemaining(remaining)}
    </span>
  );
}
