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
        scrollPosition += 0.4;
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
    <section id="features" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Every call. Every decision. Every dollar.
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Vortyx replaces a stack of legacy call-tracking tools with a single, real-time control
            plane — from inbound ring to buyer settlement.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

          <div
            ref={scrollRef}
            className={`flex gap-4 overflow-x-auto scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
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
                className="w-[300px] flex-shrink-0 rounded-2xl border border-border/60 bg-card/40 p-6 transition-colors hover:bg-card"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary/60 text-muted-foreground">
                  <feature.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-base font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
