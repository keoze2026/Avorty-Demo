"use client";

import { cn } from "@/lib/utils";

interface Props {
  data: number[];
  /** Stroke color — usually green/red depending on the trend. */
  color: string;
  className?: string;
}

/**
 * Hand-rolled SVG sparkline.
 *
 * 25-point trailing series rendered as a 130×36 viewBox polyline. Lighter than
 * spinning up a recharts instance per row when the page hosts 25+ rows.
 */
export function Sparkline({ data, color, className }: Props) {
  if (data.length < 2) return null;
  const width = 130;
  const height = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-32", className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
