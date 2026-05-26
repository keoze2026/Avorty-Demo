"use client";

/**
 * Tiny price-history sparkline shown under a listing's current price.
 * Pure SVG so it's cheap to render dozens of these on the listings grid.
 */

import { useMemo } from "react";

import { VERTICAL_PALETTE } from "@/lib/mock/marketplace";
import type { VerticalKey } from "@/lib/types";

interface Props {
  /** newest-last */
  series: number[];
  vertical: VerticalKey;
  width?: number;
  height?: number;
  className?: string;
}

export function DepthSpark({ series, vertical, width = 120, height = 28, className }: Props) {
  const path = useMemo(() => {
    if (series.length < 2) return "";
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const stepX = width / (series.length - 1);
    return series
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [series, width, height]);

  const color = VERTICAL_PALETTE[vertical].line;
  const id = `spark-fill-${vertical.toLowerCase()}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {path && (
        <>
          <path
            d={`${path} L ${width} ${height} L 0 ${height} Z`}
            fill={`url(#${id})`}
            stroke="none"
          />
          <path d={path} stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}
