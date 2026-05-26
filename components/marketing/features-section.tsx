"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Building2,
  GitFork,
  Hash,
  Plug,
  Radio,
  Shield,
  Sparkles,
  Store,
} from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Live call monitoring",
    description:
      "Watch every call land, route, and settle — sub-second decisions visible on a single screen.",
  },
  {
    icon: GitFork,
    title: "Visual routing builder",
    description:
      "Drag-and-drop ring trees with conditional filters, weighted splits, caps, and fallbacks.",
  },
  {
    icon: Store,
    title: "Real-time marketplace",
    description:
      "Connect buyers and publishers in a live auction. Watch bids settle and inventory clear in real time.",
  },
  {
    icon: Sparkles,
    title: "AI optimization",
    description:
      "Vortyx learns your network and suggests where to scale, pause, rebalance, or alert — automatically.",
  },
  {
    icon: Hash,
    title: "Numbers on demand",
    description:
      "Provision local and toll-free DIDs in bulk, organize them into pools, rotate via weighted strategies.",
  },
  {
    icon: Building2,
    title: "Multi-role RBAC",
    description:
      "Admin, buyer, and publisher roles out of the box — every screen filters to what each user should see.",
  },
  {
    icon: BarChart3,
    title: "Sub-second analytics",
    description:
      "Filter call-detail records by hour, geo, publisher, buyer, or tag — and drill all the way down.",
  },
  {
    icon: Plug,
    title: "Webhooks & integrations",
    description:
      "Every event streams to your CRM, postback, or warehouse. Retry, dedupe, and replay built in.",
  },
  {
    icon: Shield,
    title: "Compliance ready",
    description:
      "Caller consent capture, TCPA-aware routing, HIPAA-tier isolation, and full audit trails.",
  },
];

export function FeaturesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = scrollContainer.scrollLeft;

    const animate = () => {
      if (!isPaused && !isDragging && scrollContainer) {
        scrollPosition += 0.5;
        if (scrollPosition >= scrollContainer.scrollWidth / 2) scrollPosition = 0;
        scrollContainer.scrollLeft = scrollPosition;
      } else if (scrollContainer) {
        scrollPosition = scrollContainer.scrollLeft;
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const c = scrollRef.current;
    if (!c) return;
    setIsDragging(true);
    setStartX(e.pageX - c.offsetLeft);
    setScrollLeft(c.scrollLeft);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const c = scrollRef.current;
    if (!c) return;
    const x = e.pageX - c.offsetLeft;
    c.scrollLeft = scrollLeft - (x - startX) * 2;
  };

  const duplicated = [...features, ...features];

  return (
    <section id="features" className="py-24 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono uppercase tracking-wider">The platform</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Every call. Every decision. Every dollar.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Vortyx replaces a stack of legacy call-tracking tools with a single, real-time control plane —
            from inbound ring to buyer settlement.
          </p>
        </div>

        <div className="mt-16 relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className={`flex gap-6 overflow-x-auto scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              setIsDragging(false);
              setIsPaused(false);
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {duplicated.map((feature, index) => (
              <div
                key={index}
                className="group relative flex-shrink-0 w-[320px] overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-7 transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-card hover:shadow-lg hover:shadow-accent/10"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "rgba(59, 182, 255, 0.22)" }}
                />
                <div className="relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="relative font-mono text-lg font-semibold">{feature.title}</h3>
                <p className="relative mt-2 text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
