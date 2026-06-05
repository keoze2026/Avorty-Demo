"use client";

/**
 * Hero Stage — pure abstract animation. No interface chrome.
 *
 * Three layered systems, all rendered inside a contained 700px stage:
 *
 *   1. HeroVortex      — canvas-based concentric vortex with orbiting
 *                        particles, spiral arcs, and inflow streams. More
 *                        elaborate than the login BrandVortex (more rings,
 *                        more particles, bigger spiral sweeps, light beams)
 *                        but still built from the same indigo brand palette.
 *
 *   2. GlyphField      — twelve small lucide-react icons drifting slowly
 *                        through the canvas at low opacity. Hints at the
 *                        product surfaces (calls, markets, news, AI) without
 *                        showing any UI.
 *
 *   3. AccentCards     — four minimal cards with thin transparent borders,
 *                        each showing a single value + label. Floating with
 *                        breath. Hover-responsive subtle lift.
 *
 * Theme-aware + prefers-reduced-motion friendly.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  Bitcoin,
  Brain,
  DollarSign,
  Globe2,
  LineChart,
  Newspaper,
  Phone,
  Radar,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const BRAND_DEEP = [58, 75, 196] as const;
const BRAND_MID = [82, 102, 224] as const;
const BRAND_LIGHT = [129, 140, 248] as const;
const BRAND_CORE = [238, 241, 254] as const;

export function HeroStage() {
  return (
    <div className="relative h-[42rem] w-full overflow-hidden">
      <HeroVortex />
      <GlyphField />
      <AccentCards />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  HeroVortex — elaborate canvas-based vortex                          */
/* ─────────────────────────────────────────────────────────────────── */

interface RingConfig {
  rFrac: number;
  color: readonly [number, number, number];
  alphaDark: number;
  alphaLight: number;
  dash: number;
  particles: number;
  omega: number;
  size: number;
}

const RINGS: RingConfig[] = [
  { rFrac: 0.18, color: BRAND_LIGHT, alphaDark: 0.65, alphaLight: 0.55, dash: 2,   particles: 3, omega:  0.22, size: 2.2 },
  { rFrac: 0.28, color: BRAND_LIGHT, alphaDark: 0.5,  alphaLight: 0.45, dash: 2,   particles: 4, omega: -0.16, size: 2.0 },
  { rFrac: 0.4,  color: BRAND_MID,   alphaDark: 0.4,  alphaLight: 0.38, dash: 2.5, particles: 5, omega:  0.11, size: 1.8 },
  { rFrac: 0.54, color: BRAND_MID,   alphaDark: 0.3,  alphaLight: 0.3,  dash: 2.5, particles: 6, omega: -0.075, size: 1.6 },
  { rFrac: 0.7,  color: BRAND_DEEP,  alphaDark: 0.22, alphaLight: 0.22, dash: 3,   particles: 7, omega:  0.055, size: 1.4 },
  { rFrac: 0.88, color: BRAND_DEEP,  alphaDark: 0.16, alphaLight: 0.18, dash: 3,   particles: 8, omega: -0.035, size: 1.3 },
];

const SPIRAL_ARCS = [
  { rFrac: 0.24, sweep: Math.PI * 1.55, width: 1.8, alphaDark: 0.7,  alphaLight: 0.6,  color: BRAND_LIGHT, omega:  0.07  },
  { rFrac: 0.4,  sweep: Math.PI * 1.45, width: 1.5, alphaDark: 0.5,  alphaLight: 0.45, color: BRAND_MID,   omega: -0.05  },
  { rFrac: 0.6,  sweep: Math.PI * 1.35, width: 1.2, alphaDark: 0.32, alphaLight: 0.32, color: BRAND_MID,   omega:  0.03  },
  { rFrac: 0.82, sweep: Math.PI * 1.25, width: 1.0, alphaDark: 0.18, alphaLight: 0.2,  color: BRAND_DEEP,  omega: -0.018 },
];

interface OrbitalParticle {
  ringIdx: number;
  theta: number;
}

interface InflowParticle {
  angle: number;
  r: number;
  speed: number;
  color: readonly [number, number, number];
  trail: Array<{ x: number; y: number }>;
}

/** Faint "light beam" — a long radial ray that sweeps slowly through the
 *  vortex, adding depth and reading as a routing channel. */
interface LightBeam {
  angle: number;
  /** Angular velocity (rad/sec). */
  omega: number;
  /** Beam length as a fraction of the canvas half-min. */
  reach: number;
  alpha: number;
}

const BEAMS: LightBeam[] = [
  { angle: 0,             omega:  0.04,  reach: 1.05, alpha: 0.10 },
  { angle: Math.PI * 0.7, omega: -0.03,  reach: 1.0,  alpha: 0.07 },
  { angle: Math.PI * 1.3, omega:  0.025, reach: 1.1,  alpha: 0.06 },
];

function rgba(c: readonly [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

function HeroVortex() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReduced = reducedMotion.matches;
    let isDark = document.documentElement.classList.contains("dark");

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = container.offsetWidth;
    let height = container.offsetHeight;
    let cx = width / 2;
    let cy = height / 2;
    let radiusUnit = Math.min(width, height) / 1.7;

    const orbitals: OrbitalParticle[] = [];
    let inflows: InflowParticle[] = [];
    const beams: LightBeam[] = BEAMS.map((b) => ({ ...b }));
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
        angle,
        r,
        speed: 90 + Math.random() * 80,
        color,
        trail: [],
      };
    };

    const sizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width / 2;
      cy = height / 2;
      radiusUnit = Math.min(width, height) / 1.7;
      seedOrbitals();
      inflows = [];
    };
    sizeCanvas();

    let last = performance.now();
    let nextInflowAt = last + 600;
    let rafId = 0;
    let running = true;

    const paintBeams = () => {
      // Long, low-alpha radial gradients sweeping the vortex.
      for (const beam of beams) {
        if (!isReduced) beam.angle += beam.omega * 0.016;
        const x2 = cx + Math.cos(beam.angle) * radiusUnit * beam.reach;
        const y2 = cy + Math.sin(beam.angle) * radiusUnit * beam.reach;
        const grad = ctx.createLinearGradient(cx, cy, x2, y2);
        const c = isDark ? BRAND_LIGHT : BRAND_MID;
        grad.addColorStop(0, rgba(c, beam.alpha * 1.5));
        grad.addColorStop(0.6, rgba(c, beam.alpha));
        grad.addColorStop(1, rgba(c, 0));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 60;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    const paintCore = () => {
      const breath = 0.85 + Math.sin(globalAngle * 6) * 0.15;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusUnit * 0.45 * breath);
      if (isDark) {
        grad.addColorStop(0, rgba(BRAND_CORE, 0.22 * breath));
        grad.addColorStop(0.4, rgba(BRAND_LIGHT, 0.12));
        grad.addColorStop(1, rgba(BRAND_LIGHT, 0));
      } else {
        grad.addColorStop(0, rgba(BRAND_LIGHT, 0.24 * breath));
        grad.addColorStop(0.4, rgba(BRAND_MID, 0.1));
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
        const start = globalAngle * arc.omega * 18;
        const alpha = isDark ? arc.alphaDark : arc.alphaLight;
        ctx.strokeStyle = rgba(arc.color, alpha);
        ctx.lineWidth = arc.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, start + arc.sweep);
        ctx.stroke();
        const tipX = cx + Math.cos(start + arc.sweep) * r;
        const tipY = cy + Math.sin(start + arc.sweep) * r;
        const sparkGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 18);
        const sparkColor = isDark ? BRAND_CORE : BRAND_LIGHT;
        sparkGrad.addColorStop(0, rgba(sparkColor, 0.95));
        sparkGrad.addColorStop(1, rgba(sparkColor, 0));
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 18, 0, Math.PI * 2);
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
        ctx.fillStyle = rgba(ring.color, isDark ? 0.9 : 0.75);
        ctx.beginPath();
        ctx.arc(x, y, ring.size, 0, Math.PI * 2);
        ctx.fill();
        const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, ring.size * 4.5);
        haloGrad.addColorStop(0, rgba(ring.color, isDark ? 0.45 : 0.3));
        haloGrad.addColorStop(1, rgba(ring.color, 0));
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(x, y, ring.size * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const paintInflow = (dt: number) => {
      if (!isReduced && performance.now() >= nextInflowAt && inflows.length < 8) {
        inflows.push(seedInflow());
        nextInflowAt = performance.now() + 1800 + Math.random() * 2200;
      }
      for (let i = inflows.length - 1; i >= 0; i -= 1) {
        const p = inflows[i];
        if (!isReduced) {
          p.r -= p.speed * dt;
          p.angle += 0.6 * dt * (radiusUnit / Math.max(40, p.r));
          const x = cx + Math.cos(p.angle) * p.r;
          const y = cy + Math.sin(p.angle) * p.r;
          p.trail.unshift({ x, y });
          if (p.trail.length > 14) p.trail.length = 14;
        }
        for (let k = p.trail.length - 1; k >= 0; k -= 1) {
          const t = p.trail[k];
          const alpha = (1 - k / p.trail.length) * (isDark ? 0.7 : 0.55);
          ctx.fillStyle = rgba(p.color, alpha);
          ctx.beginPath();
          ctx.arc(t.x, t.y, k === 0 ? 2 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (p.r < radiusUnit * 0.06) {
          const flashColor = isDark ? BRAND_CORE : BRAND_LIGHT;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
          grad.addColorStop(0, rgba(flashColor, isDark ? 0.5 : 0.35));
          grad.addColorStop(1, rgba(flashColor, 0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, 90, 0, Math.PI * 2);
          ctx.fill();
          inflows.splice(i, 1);
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(40, now - last) / 1000;
      last = now;
      if (!isReduced) globalAngle += 0.06 * dt;
      ctx.clearRect(0, 0, width, height);
      paintBeams();
      paintCore();
      paintRings();
      paintOrbitals(dt);
      paintSpirals();
      paintInflow(dt);
      if (running) rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => sizeCanvas());
    ro.observe(container);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (!running) {
          running = true;
          last = performance.now();
          nextInflowAt = last + 600;
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
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onReducedMotionChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        aria-hidden
        role="presentation"
        className="block h-full w-full"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Glyph field — small drifting icons hinting at product breadth       */
/* ─────────────────────────────────────────────────────────────────── */

const GLYPHS = [
  { Icon: Phone,      top: "12%",  left: "18%",  delay: 0,    duration: 14, amp: 14 },
  { Icon: DollarSign, top: "26%",  left: "78%",  delay: 1.2,  duration: 16, amp: 18 },
  { Icon: TrendingUp, top: "62%",  left: "12%",  delay: 0.6,  duration: 13, amp: 12 },
  { Icon: Newspaper,  top: "70%",  left: "82%",  delay: 1.8,  duration: 17, amp: 16 },
  { Icon: Sparkles,   top: "18%",  left: "48%",  delay: 0.9,  duration: 15, amp: 10 },
  { Icon: Bitcoin,    top: "44%",  left: "9%",   delay: 2.4,  duration: 18, amp: 20 },
  { Icon: Brain,      top: "82%",  left: "44%",  delay: 0.3,  duration: 14, amp: 14 },
  { Icon: Radar,      top: "30%",  left: "30%",  delay: 1.5,  duration: 16, amp: 16 },
  { Icon: LineChart,  top: "56%",  left: "88%",  delay: 2.1,  duration: 13, amp: 12 },
  { Icon: Bell,       top: "8%",   left: "64%",  delay: 0.4,  duration: 15, amp: 14 },
  { Icon: Globe2,     top: "88%",  left: "22%",  delay: 1.0,  duration: 17, amp: 18 },
  { Icon: Activity,   top: "38%",  left: "68%",  delay: 2.7,  duration: 14, amp: 12 },
];

function GlyphField() {
  return (
    <>
      {GLYPHS.map((g, i) => {
        const Icon = g.Icon;
        return (
          <span
            key={i}
            aria-hidden
            className="hero-glyph pointer-events-none absolute text-accent/15"
            style={{
              top: g.top,
              left: g.left,
              animationDelay: `${g.delay}s`,
              animationDuration: `${g.duration}s`,
              ["--hero-glyph-amp" as string]: `${g.amp}px`,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
        );
      })}
      <style jsx global>{`
        @keyframes hero-glyph-drift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.6; }
          50%      { transform: translate3d(0, calc(-1 * var(--hero-glyph-amp, 14px)), 0) rotate(2deg); opacity: 1; }
        }
        .hero-glyph {
          animation: hero-glyph-drift var(--duration, 15s) ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-glyph { animation: none; }
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Accent cards — minimal, thin transparent borders, just a number     */
/* ─────────────────────────────────────────────────────────────────── */

interface AccentSpec {
  /** Anchor inside the stage — use `right` / `bottom` for the right + bottom
   *  cards so they hug the edge even on narrow viewports. */
  position: { left?: string; right?: string; top?: string; bottom?: string };
  /** i18n keys for the chip label + value. */
  labelKey: string;
  valueKey: string;
  /** Optional delta percent rendered as a tiny chip. */
  delta?: number;
  /** Mount stagger order. */
  index: number;
  /** Breath animation class for the floating motion. */
  breathClass: string;
}

const ACCENT_SPECS: AccentSpec[] = [
  // Left + top — anchored from the LEFT edge.
  {
    position: { left: "4%", top: "10%" },
    labelKey: "marketingUI.hero.stage.briefings.label",
    valueKey: "marketingUI.hero.stage.briefings.value",
    delta: 24,
    index: 0,
    breathClass: "hero-stage-breath-a",
  },
  // Right + top — anchored from the RIGHT edge so "$285K" never clips.
  {
    position: { right: "4%", top: "6%" },
    labelKey: "marketingUI.hero.stage.revenue.label",
    valueKey: "marketingUI.hero.stage.revenue.value",
    delta: 18,
    index: 1,
    breathClass: "hero-stage-breath-b",
  },
  // Left + bottom.
  {
    position: { left: "4%", bottom: "12%" },
    labelKey: "marketingUI.hero.stage.markets.label",
    valueKey: "marketingUI.hero.stage.markets.value",
    delta: 2.4,
    index: 2,
    breathClass: "hero-stage-breath-c",
  },
  // Right + bottom — anchored from the RIGHT edge so "AI CONFIDENCE" never clips.
  {
    position: { right: "4%", bottom: "14%" },
    labelKey: "marketingUI.hero.stage.ai.label",
    valueKey: "marketingUI.hero.stage.ai.value",
    index: 3,
    breathClass: "hero-stage-breath-d",
  },
];

function AccentCards() {
  const { t } = useTranslation();
  return (
    <>
      {ACCENT_SPECS.map((spec) => (
        <motion.div
          key={spec.labelKey}
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.6 + spec.index * 0.14,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            left: spec.position.left,
            right: spec.position.right,
            top: spec.position.top,
            bottom: spec.position.bottom,
          }}
          className={cn(
            // Responsive sizing — chip is tighter on phones (px-2.5 py-2 /
            // text-base) and expands at sm+ so it never overflows a 360px
            // viewport. `max-w-[42vw]` caps width so the chip can't push
            // past the centre of the stage on tiny screens.
            "absolute z-20 inline-flex max-w-[42vw] flex-col items-start gap-0.5 rounded-xl border border-accent/12 bg-card/15 px-2.5 py-2 backdrop-blur-md sm:max-w-none sm:gap-1 sm:px-4 sm:py-3",
            "transition-transform duration-300 hover:scale-[1.04] hover:border-accent/25",
            spec.breathClass,
          )}
        >
          <div className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:gap-2 sm:text-[9px] sm:tracking-[0.18em]">
            <span className="inline-block h-1 w-1 rounded-full bg-accent/70 sm:h-1.5 sm:w-1.5" />
            <span className="truncate">{t(spec.labelKey)}</span>
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-base font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
              {t(spec.valueKey)}
            </span>
            {typeof spec.delta === "number" && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums",
                  spec.delta >= 0 ? "text-[color:var(--success)]" : "text-destructive",
                )}
              >
                {spec.delta >= 0 ? "↑" : "↓"}
                {Math.abs(spec.delta)}%
              </span>
            )}
          </div>
        </motion.div>
      ))}

      {/* Breathing keyframes — out-of-phase translateY floats. */}
      <style jsx global>{`
        @keyframes hero-stage-breath-a {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes hero-stage-breath-b {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        @keyframes hero-stage-breath-c {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes hero-stage-breath-d {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(8px); }
        }
        .hero-stage-breath-a { animation: hero-stage-breath-a 6.5s ease-in-out infinite; }
        .hero-stage-breath-b { animation: hero-stage-breath-b 7.2s ease-in-out infinite 0.6s; }
        .hero-stage-breath-c { animation: hero-stage-breath-c 6.8s ease-in-out infinite 1.2s; }
        .hero-stage-breath-d { animation: hero-stage-breath-d 7.6s ease-in-out infinite 1.8s; }
        @media (prefers-reduced-motion: reduce) {
          .hero-stage-breath-a,
          .hero-stage-breath-b,
          .hero-stage-breath-c,
          .hero-stage-breath-d {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
