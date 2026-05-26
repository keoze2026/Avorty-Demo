"use client";

/**
 * Customer testimonials — quote, avatar, role, company.
 * Three cards in a responsive grid. The middle card on desktop gets a
 * slight feature lift to draw the eye.
 */

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Initials shown in the avatar gradient */
  initials: string;
  /** Gradient stops for the avatar */
  avatar: [string, string];
  metric: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Vortyx replaced four tools and gave my team a routing graph we can actually reason about. We launched a new vertical the same week we signed.",
    name: "Morgan Reed",
    role: "VP, Performance",
    company: "BuyersCo",
    initials: "MR",
    avatar: ["#3bb6ff", "#1656d6"],
    metric: "4 tools → 1",
  },
  {
    quote:
      "We A/B tested our entire ring tree in a single day. That used to take quarters of engineering work and a stack of spreadsheets.",
    name: "Riley Chen",
    role: "Director of Traffic",
    company: "TrafficHub",
    initials: "RC",
    avatar: ["#7de1ff", "#3bb6ff"],
    metric: "Quarters → 1 day",
  },
  {
    quote:
      "The compliance toolkit alone justified the move. Auditors stopped pushing back the moment we shared the audit log.",
    name: "Avery Quinn",
    role: "COO",
    company: "HealthDirect",
    initials: "AQ",
    avatar: ["#a855f7", "#1656d6"],
    metric: "SOC 2 in days",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground backdrop-blur">
            <Star className="h-3 w-3 fill-accent text-accent" />
            Operator voices
          </span>
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Loved by the teams running the network at 2am.
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Real operators, real campaigns, real revenue. The kind of feedback we screenshot and pin.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
              className={`group relative overflow-hidden rounded-2xl border bg-card/60 p-7 backdrop-blur-md transition-all hover:-translate-y-1 ${
                i === 1
                  ? "border-accent/40 shadow-xl shadow-accent/10 lg:scale-[1.02]"
                  : "border-border/60 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10"
              }`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "rgba(59, 182, 255, 0.18)" }}
              />

              <Quote className="h-6 w-6 text-accent/70" />

              <blockquote className="relative mt-4 text-balance text-base leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>

              {/* 5-star row */}
              <div className="relative mt-5 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </div>

              <figcaption className="relative mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-mono font-bold text-background shadow"
                    style={{
                      background: `linear-gradient(135deg, ${t.avatar[0]}, ${t.avatar[1]})`,
                    }}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {t.role} · <span className="font-mono">{t.company}</span>
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-mono text-accent">
                  {t.metric}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
