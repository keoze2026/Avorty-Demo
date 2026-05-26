"use client";

/**
 * Animated rolling price with up/down accent flash.
 * Used by the featured-auction "current top bid" and the ticker.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface Props {
  value: number;
  /** "lg" 4xl heading style, "md" inline, "sm" tiny */
  size?: "lg" | "md" | "sm";
  className?: string;
}

const SIZE = {
  lg: "text-4xl sm:text-5xl",
  md: "text-base",
  sm: "text-xs",
} as const;

export function AnimatedPrice({ value, size = "md", className }: Props) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value > prevRef.current) {
      setFlash("up");
    } else if (value < prevRef.current) {
      setFlash("down");
    }
    prevRef.current = value;
    const t = setTimeout(() => setFlash(null), 450);
    return () => clearTimeout(t);
  }, [value]);

  const flashClass =
    flash === "up"
      ? "text-[color:var(--success)]"
      : flash === "down"
        ? "text-destructive"
        : "text-foreground";

  return (
    <motion.span
      key={value} /* re-mount on each change for the morph */
      initial={{ opacity: 0.4, scale: 0.98, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "inline-block font-mono tabular-nums font-bold tracking-tight transition-colors duration-300",
        SIZE[size],
        flashClass,
        className,
      )}
    >
      ${value.toFixed(2)}
    </motion.span>
  );
}
