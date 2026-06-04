"use client";

/**
 * Brand-vortex background for the (auth) layout.
 *
 * The Vortyx logo is a three-arc spiral sweeping toward a bright core — this
 * extrudes that metaphor to ambient scale: concentric rings rotate around a
 * pinned-left centre, signal particles orbit each ring, and stray "inflow"
 * particles drift in from the edges and get pulled toward the core. The
 * visual reads as "Vortyx is the hub that everything (calls, news, crypto,
 * insights) funnels through."
 *
 * Strict brand palette — only the four indigo tones from the logo:
 *   #3A4BC4 (deep)  #5266E0 (mid)  #818CF8 (light)  #EEF1FE (core)
 *
 * Two themes:
 *   • dark   — deep indigo-navy base with bright orbits
 *   • light  — pale-cream base with low-alpha indigo accents
 *
 * Behavioural guarantees:
 *   • prefers-reduced-motion → static frame, no rotation, no inflow
 *   • document.visibilityState === "hidden" → RAF paused
 *   • MutationObserver on <html class> → re-paints when the theme toggles
 *   • DPR capped at 2
 *   • No third-party deps
 */

import { useEffect, useRef } from "react";

const BRAND_DEEP = [58, 75, 196] as const; // #3A4BC4
const BRAND_MID = [82, 102, 224] as const; // #5266E0
const BRAND_LIGHT = [129, 140, 248] as const; // #818CF8
const BRAND_CORE = [238, 241, 254] as const; // #EEF1FE

interface RingConfig {
  /** Radius as a fraction of the half-min-dimension. */
  rFrac: number;
  /** Stroke color tuple. */
  color: readonly [number, number, number];
  /** Stroke alpha for the dark theme. */
  alphaDark: number;
  /** Stroke alpha for the light theme. */
  alphaLight: number;
  /** Dash pattern length (px units before DPR). */
  dash: number;
  /** Number of orbital particles riding this ring. */
  particles: number;
  /** Angular velocity (rad/sec). */
  omega: number;
  /** Particle radius (px). */
  size: number;
}

/** Six concentric rings. Inner rings use the lighter tone and rotate
 *  faster; outer rings are deeper and slower — same rhythm as the logo. */
const RINGS: RingConfig[] = [
  { rFrac: 0.22, color: BRAND_LIGHT, alphaDark: 0.55, alphaLight: 0.45, dash: 2.5, particles: 3, omega: 0.18, size: 2.0 },
  { rFrac: 0.34, color: BRAND_LIGHT, alphaDark: 0.42, alphaLight: 0.36, dash: 2.5, particles: 4, omega: -0.13, size: 1.8 },
  { rFrac: 0.48, color: BRAND_MID, alphaDark: 0.32, alphaLight: 0.3, dash: 3, particles: 5, omega: 0.09, size: 1.6 },
  { rFrac: 0.64, color: BRAND_MID, alphaDark: 0.22, alphaLight: 0.22, dash: 3, particles: 6, omega: -0.06, size: 1.5 },
  { rFrac: 0.82, color: BRAND_DEEP, alphaDark: 0.17, alphaLight: 0.17, dash: 4, particles: 7, omega: 0.045, size: 1.3 },
  { rFrac: 1.0, color: BRAND_DEEP, alphaDark: 0.12, alphaLight: 0.13, dash: 4, particles: 8, omega: -0.03, size: 1.2 },
];

/** Three rotating spiral arcs that echo the logo at ambient scale. */
const SPIRAL_ARCS = [
  { rFrac: 0.28, sweep: Math.PI * 1.5, width: 1.4, alphaDark: 0.55, alphaLight: 0.5, color: BRAND_LIGHT, omega: 0.06 },
  { rFrac: 0.46, sweep: Math.PI * 1.4, width: 1.2, alphaDark: 0.4, alphaLight: 0.38, color: BRAND_MID, omega: -0.04 },
  { rFrac: 0.7, sweep: Math.PI * 1.3, width: 1.0, alphaDark: 0.25, alphaLight: 0.26, color: BRAND_MID, omega: 0.025 },
];

interface OrbitalParticle {
  ringIdx: number;
  /** Current angle on the ring (rad). */
  theta: number;
}

interface InflowParticle {
  x: number;
  y: number;
  angle: number;
  r: number;
  speed: number;
  color: readonly [number, number, number];
  trail: Array<{ x: number; y: number }>;
}

function rgba(c: readonly [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

interface BrandVortexProps {
  /** Horizontal centre of the vortex as a fraction of viewport width (0..1).
   *  Default 0.5 (centred). Set to 0.35 to bias toward the left so the form
   *  on the right has clean breathing room above the vortex's edge. */
  centerX?: number;
}

export function BrandVortex({ centerX = 0.5 }: BrandVortexProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReduced = reducedMotion.matches;
    let isDark = document.documentElement.classList.contains("dark");
    /** On wide screens the form is on the right, so pin the vortex left.
     *  On narrow screens the form is centred, so centre the vortex too. */
    const wideScreen = () => window.innerWidth >= 1024;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cx = width * centerX;
    let cy = height / 2;
    let radiusUnit = Math.min(width, height) / 2;

    const orbitals: OrbitalParticle[] = [];
    let inflows: InflowParticle[] = [];

    /** Global rotation drift — one full turn every ~2 minutes. */
    let globalAngle = 0;

    const seedOrbitals = () => {
      orbitals.length = 0;
      RINGS.forEach((ring, ringIdx) => {
        for (let i = 0; i < ring.particles; i += 1) {
          orbitals.push({
            ringIdx,
            theta: (i / ring.particles) * Math.PI * 2 + Math.random() * 0.4,
          });
        }
      });
    };

    const seedInflow = (): InflowParticle => {
      const angle = Math.random() * Math.PI * 2;
      const r = radiusUnit * 1.15;
      const palette: Array<readonly [number, number, number]> = [
        BRAND_LIGHT,
        BRAND_LIGHT,
        BRAND_MID,
        BRAND_MID,
        BRAND_DEEP,
      ];
      const color = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        angle,
        r,
        speed: rand(80, 140),
        color,
        trail: [],
      };
    };

    const sizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width * (wideScreen() ? centerX : 0.5);
      cy = height / 2;
      // Widen the radius unit on wide screens so the outer rings reach into
      // the right column and visually unite the two zones. On narrow / square
      // viewports fall back to half-min for the original tight composition.
      radiusUnit = wideScreen()
        ? Math.max(Math.min(width, height) / 2, width * 0.42)
        : Math.min(width, height) / 2;
      seedOrbitals();
      inflows = [];
    };

    sizeCanvas();

    let last = performance.now();
    let nextInflowAt = last + 800;
    let rafId = 0;
    let running = true;

    /* ─── Painting passes (theme-aware via `isDark`) ─────────────── */

    const paintBase = () => {
      // Dark: deep indigo-navy radial. Light: pale cream/blue.
      const grad = ctx.createRadialGradient(
        cx,
        cy,
        radiusUnit * 0.05,
        cx,
        cy,
        radiusUnit * 1.5,
      );
      if (isDark) {
        grad.addColorStop(0, "rgb(20, 22, 60)");
        grad.addColorStop(0.5, "rgb(12, 13, 42)");
        grad.addColorStop(1, "rgb(4, 5, 18)");
      } else {
        // Soft daylight — very pale blue centre, near-white edges.
        grad.addColorStop(0, "rgb(240, 243, 255)");
        grad.addColorStop(0.55, "rgb(248, 250, 254)");
        grad.addColorStop(1, "rgb(252, 253, 255)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const paintCore = () => {
      // "Calm eye" glow — gentle 0.04 Hz breath.
      const breath = 0.85 + Math.sin(globalAngle * 4) * 0.15;
      const grad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        radiusUnit * 0.42 * breath,
      );
      if (isDark) {
        grad.addColorStop(0, rgba(BRAND_CORE, 0.18 * breath));
        grad.addColorStop(0.5, rgba(BRAND_LIGHT, 0.08));
        grad.addColorStop(1, rgba(BRAND_LIGHT, 0));
      } else {
        grad.addColorStop(0, rgba(BRAND_LIGHT, 0.18 * breath));
        grad.addColorStop(0.5, rgba(BRAND_MID, 0.07));
        grad.addColorStop(1, rgba(BRAND_MID, 0));
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusUnit * 0.55, 0, Math.PI * 2);
      ctx.fill();
    };

    const paintRings = () => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(globalAngle * 0.4);
      for (const ring of RINGS) {
        const r = ring.rFrac * radiusUnit;
        const alpha = isDark ? ring.alphaDark : ring.alphaLight;
        ctx.strokeStyle = rgba(ring.color, alpha);
        ctx.lineWidth = 1;
        ctx.setLineDash([ring.dash, ring.dash * 2.5]);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    };

    const paintSpirals = () => {
      for (const arc of SPIRAL_ARCS) {
        const r = arc.rFrac * radiusUnit;
        const start = globalAngle * arc.omega * 14;
        const alpha = isDark ? arc.alphaDark : arc.alphaLight;
        ctx.strokeStyle = rgba(arc.color, alpha);
        ctx.lineWidth = arc.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, start + arc.sweep);
        ctx.stroke();
        // Leading-edge spark — echoes the logo's core highlight.
        const tipX = cx + Math.cos(start + arc.sweep) * r;
        const tipY = cy + Math.sin(start + arc.sweep) * r;
        const sparkGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 14);
        const sparkColor = isDark ? BRAND_CORE : BRAND_LIGHT;
        sparkGrad.addColorStop(0, rgba(sparkColor, 0.9));
        sparkGrad.addColorStop(1, rgba(sparkColor, 0));
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const paintOrbitals = (dt: number) => {
      for (const p of orbitals) {
        const ring = RINGS[p.ringIdx];
        if (!isReduced) p.theta += ring.omega * dt;
        const r = ring.rFrac * radiusUnit;
        const x = cx + Math.cos(p.theta) * r;
        const y = cy + Math.sin(p.theta) * r;
        ctx.fillStyle = rgba(ring.color, isDark ? 0.85 : 0.7);
        ctx.beginPath();
        ctx.arc(x, y, ring.size, 0, Math.PI * 2);
        ctx.fill();
        const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, ring.size * 4);
        haloGrad.addColorStop(0, rgba(ring.color, isDark ? 0.4 : 0.25));
        haloGrad.addColorStop(1, rgba(ring.color, 0));
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(x, y, ring.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const paintInflow = (dt: number) => {
      if (!isReduced && performance.now() >= nextInflowAt && inflows.length < 6) {
        inflows.push(seedInflow());
        nextInflowAt = performance.now() + rand(3200, 5500);
      }
      for (let i = inflows.length - 1; i >= 0; i -= 1) {
        const p = inflows[i];
        if (!isReduced) {
          p.r -= p.speed * dt;
          p.angle += 0.6 * dt * (radiusUnit / Math.max(40, p.r));
          p.x = cx + Math.cos(p.angle) * p.r;
          p.y = cy + Math.sin(p.angle) * p.r;
          p.trail.unshift({ x: p.x, y: p.y });
          if (p.trail.length > 12) p.trail.length = 12;
        } else if (p.trail.length === 0) {
          p.trail.unshift({ x: p.x, y: p.y });
        }
        for (let k = p.trail.length - 1; k >= 0; k -= 1) {
          const t = p.trail[k];
          const alpha = (1 - k / p.trail.length) * (isDark ? 0.6 : 0.45);
          ctx.fillStyle = rgba(p.color, alpha);
          ctx.beginPath();
          ctx.arc(t.x, t.y, k === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
        if (p.r < radiusUnit * 0.06) {
          // Reached the core — soft ripple flash on arrival.
          const flashColor = isDark ? BRAND_CORE : BRAND_LIGHT;
          const coreFlash = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
          coreFlash.addColorStop(0, rgba(flashColor, isDark ? 0.4 : 0.28));
          coreFlash.addColorStop(1, rgba(flashColor, 0));
          ctx.fillStyle = coreFlash;
          ctx.beginPath();
          ctx.arc(cx, cy, 70, 0, Math.PI * 2);
          ctx.fill();
          inflows.splice(i, 1);
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(40, now - last) / 1000;
      last = now;
      if (!isReduced) globalAngle += 0.05 * dt;

      paintBase();
      paintCore();
      paintRings();
      paintOrbitals(dt);
      paintSpirals();
      paintInflow(dt);

      if (running) rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    /* ─── Lifecycle hooks ─────────────────────────────────────────── */

    const onResize = () => sizeCanvas();
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (!running) {
          running = true;
          last = performance.now();
          nextInflowAt = last + 800;
          rafId = requestAnimationFrame(frame);
        }
      } else {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      isReduced = e.matches;
    };
    reducedMotion.addEventListener("change", onReducedMotionChange);

    /** Theme toggles flip the `dark` class on <html> — observe so the
     *  vortex repaints with the matching palette without a remount. */
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onReducedMotionChange);
      themeObserver.disconnect();
    };
  }, [centerX]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      role="presentation"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
