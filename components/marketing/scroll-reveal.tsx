"use client";

/**
 * Scroll-driven reveal primitives for marketing surfaces.
 *
 *   <ScrollReveal>        — fades and slides a single block into view
 *   <StaggerReveal>       — wraps a parent that cascades motion to its
 *                            children (use <StaggerItem> inside)
 *   <StaggerItem>         — opt-in stagger child
 *
 * All three honor `prefers-reduced-motion`. Motion fires once on first
 * entry (`viewport.once: true`) so scrolling back never re-triggers it.
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  y?: number;
  delay?: number;
  duration?: number;
  viewportMargin?: string;
  className?: string;
}

export function ScrollReveal({
  children,
  y = 32,
  delay = 0,
  duration = 0.7,
  viewportMargin = "0px 0px -10% 0px",
  className,
}: ScrollRevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger reveal ──────────────────────────────────────────────── */

interface StaggerRevealProps {
  children: ReactNode;
  /** Seconds between each child's reveal. Default 0.08. */
  stagger?: number;
  /** Initial delay before the cascade begins. */
  delay?: number;
  /** Viewport margin for early trigger. */
  viewportMargin?: string;
  className?: string;
}

export function StaggerReveal({
  children,
  stagger = 0.08,
  delay = 0,
  viewportMargin = "0px 0px -10% 0px",
  className,
}: StaggerRevealProps) {
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: reduced ? 0 : stagger,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={container}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  /** Vertical translation in px before reveal. Default 24. */
  y?: number;
  duration?: number;
  className?: string;
}

export function StaggerItem({
  children,
  y = 24,
  duration = 0.55,
  className,
}: StaggerItemProps) {
  const reduced = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1] },
    },
  };
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
