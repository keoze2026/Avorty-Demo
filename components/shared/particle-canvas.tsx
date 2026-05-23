"use client";

/**
 * Reusable canvas particle layer extracted from the original hero animation.
 * Dots travel along an invisible grid, leaving short trails — gives the
 * Vortyx hero/dashboard sections their signature "live network" feel.
 */

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface ParticleCanvasProps {
  className?: string;
  /** number of moving particles */
  dotCount?: number;
  /** size of one grid cell, in px (sync with GridBackground for alignment) */
  gridSizePx?: number;
  /** stroke color in rgba */
  color?: string;
}

interface GridDot {
  x: number;
  y: number;
  direction: "horizontal" | "vertical";
  speed: number;
  size: number;
  opacity: number;
  targetX: number;
  targetY: number;
  trail: { x: number; y: number }[];
}

export function ParticleCanvas({
  className,
  dotCount = 28,
  gridSizePx = 64,
  /** Defaults to the `--vortyx-particle` CSS var so it tracks the theme. */
  color,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve the canvas stroke color: explicit prop > CSS var > fallback.
    const resolvedColor =
      color ??
      (typeof window !== "undefined"
        ? getComputedStyle(canvas).getPropertyValue("--vortyx-particle").trim() ||
          "rgba(125, 225, 255, 0.55)"
        : "rgba(125, 225, 255, 0.55)");

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const snap = (v: number) => Math.round(v / gridSizePx) * gridSizePx;
    const dots: GridDot[] = Array.from({ length: dotCount }).map(() => {
      const horizontal = Math.random() > 0.5;
      const x = snap(Math.random() * canvas.offsetWidth);
      const y = snap(Math.random() * canvas.offsetHeight);
      return {
        x,
        y,
        direction: horizontal ? "horizontal" : "vertical",
        speed: Math.random() * 9 + 7.5,
        size: Math.random() * 2 + 2,
        opacity: Math.random() * 0.5 + 0.3,
        targetX: x,
        targetY: y,
        trail: [],
      };
    });

    let rafId = 0;
    let last = 0;
    const interval = 1000 / 30;

    const step = (now: number) => {
      rafId = requestAnimationFrame(step);
      const dt = now - last;
      if (dt < interval) return;
      last = now - (dt % interval);

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      for (const d of dots) {
        d.trail.unshift({ x: d.x, y: d.y });
        if (d.trail.length > 10) d.trail.pop();

        if (d.direction === "horizontal") {
          if (Math.abs(d.x - d.targetX) < d.speed) {
            d.x = d.targetX;
            if (Math.random() > 0.7) {
              d.direction = "vertical";
              d.targetY = d.y + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1) * gridSizePx;
            } else {
              d.targetX = d.x + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 2) * gridSizePx;
            }
          } else {
            d.x += d.x < d.targetX ? d.speed : -d.speed;
          }
        } else {
          if (Math.abs(d.y - d.targetY) < d.speed) {
            d.y = d.targetY;
            if (Math.random() > 0.7) {
              d.direction = "horizontal";
              d.targetX = d.x + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 2) * gridSizePx;
            } else {
              d.targetY = d.y + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1) * gridSizePx;
            }
          } else {
            d.y += d.y < d.targetY ? d.speed : -d.speed;
          }
        }

        // Wrap
        if (d.x < -gridSizePx) { d.x = canvas.offsetWidth + gridSizePx; d.targetX = d.x; d.trail = []; }
        if (d.x > canvas.offsetWidth + gridSizePx) { d.x = -gridSizePx; d.targetX = d.x; d.trail = []; }
        if (d.y < -gridSizePx) { d.y = canvas.offsetHeight + gridSizePx; d.targetY = d.y; d.trail = []; }
        if (d.y > canvas.offsetHeight + gridSizePx) { d.y = -gridSizePx; d.targetY = d.y; d.trail = []; }

        // Trail
        if (d.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          for (const p of d.trail) ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = resolvedColor;
          ctx.globalAlpha = d.opacity * 0.4;
          ctx.lineWidth = d.size;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // Halo + core
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = d.opacity * 0.15;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = d.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [color, dotCount, gridSizePx]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full pointer-events-none", className)}
      aria-hidden
    />
  );
}
