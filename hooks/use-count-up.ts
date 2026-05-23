"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpOptions {
  /** ms */
  duration?: number;
  /** ease "linear" | "out" | "outQuart" */
  easing?: "linear" | "out" | "outQuart";
}

const EASING = {
  linear: (t: number) => t,
  out: (t: number) => 1 - Math.pow(1 - t, 2),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
} as const;

/**
 * Animate from previous value to `value`. Returns the current displayed number.
 */
export function useCountUp(value: number, { duration = 900, easing = "outQuart" }: CountUpOptions = {}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = EASING[easing](t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, easing]);

  return display;
}
