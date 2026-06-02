"use client";

/**
 * Compact live-audio waveform.
 *
 * A row of vertical bars that pulse at staggered intervals to suggest audio
 * activity on an in-progress call. Animation is pure CSS so it costs nothing
 * on the React side; we still pause the animation when the element scrolls
 * offscreen so a long list of live calls doesn't burn the GPU.
 */

import * as React from "react";

import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface CallWaveformProps {
  /** Number of bars in the waveform (default 6). */
  bars?: number;
  /** Tailwind size — height/width per bar group. */
  size?: "sm" | "md";
  /** Color override; defaults to the current text color so the parent
   *  decides the hue via `text-accent`, `text-destructive`, etc. */
  className?: string;
  /** When false, freezes the animation (e.g. ringing not yet connected). */
  active?: boolean;
  /** Optional ARIA label override. */
  label?: string;
}

const SIZE_CLASSES = {
  sm: { wrap: "h-3.5 gap-[2px]", bar: "w-[2px]" },
  md: { wrap: "h-4 gap-[3px]", bar: "w-[2.5px]" },
};

// Hand-picked stagger so the pattern doesn't read as obvious sine waves.
// Each entry is a [delayMs, durationMs] pair; index modulo bars.
const PATTERN: Array<[number, number]> = [
  [0, 900],
  [120, 780],
  [60, 980],
  [200, 720],
  [40, 880],
  [160, 940],
  [80, 820],
];

export function CallWaveform({
  bars = 6,
  size = "sm",
  className,
  active = true,
  label,
}: CallWaveformProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("liveUI.card.waveformLabel");
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !ref.current) return;
    const node = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const playing = active && visible;
  const sz = SIZE_CLASSES[size];

  return (
    <span
      ref={ref}
      role="img"
      aria-label={resolvedLabel}
      className={cn(
        "inline-flex items-center",
        sz.wrap,
        className,
      )}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const [delay, duration] = PATTERN[i % PATTERN.length];
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "block rounded-full bg-current",
              sz.bar,
              "h-full",
              playing && "animate-waveform-bar",
            )}
            style={{
              animationDelay: playing ? `${delay}ms` : undefined,
              animationDuration: playing ? `${duration}ms` : undefined,
              // When paused, hold the bars at a low resting height so the
              // component still looks deliberate instead of empty.
              transform: playing ? undefined : "scaleY(0.35)",
              transformOrigin: "center",
            }}
          />
        );
      })}
    </span>
  );
}
