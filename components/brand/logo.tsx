/**
 * Vortyx logo — vector mark (inline SVG).
 * Uses an indigo gradient (#7064F2 → #5048E5 → #32358B) that matches the
 * Featurebase-aligned brand palette while keeping the vortex feel.
 */

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Render the spin animation (e.g. hero, loading states) */
  animated?: boolean;
  /** Optional uid suffix when multiple instances exist on a page */
  uid?: string;
}

export function Logo({ className, animated = false, uid = "root" }: LogoProps) {
  const gradId = `vortyx-grad-${uid}`;
  const coreId = `vortyx-core-${uid}`;
  const glowId = `vortyx-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", animated && "animate-vortyx-spin", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7064F2" />
          <stop offset="55%" stopColor="#5048E5" />
          <stop offset="100%" stopColor="#32358B" />
        </linearGradient>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F4F0FF" stopOpacity="1" />
          <stop offset="60%" stopColor="#9182F8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#7064F2" stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="32" cy="32" r="20" fill={`url(#${coreId})`} opacity="0.45" />

      <path
        d="M52 32a20 20 0 1 1-13.2-18.8"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />
      <path
        d="M44.5 32a12.5 12.5 0 1 1-8.9-11.9"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        opacity="0.92"
      />
      <path
        d="M38 32a6 6 0 1 1-4.2-5.7"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        opacity="0.9"
      />

      <circle cx="32" cy="32" r="1.6" fill="#F4F0FF" filter={`url(#${glowId})`} />
    </svg>
  );
}
