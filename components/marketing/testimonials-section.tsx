"use client";

/**
 * Customer testimonials — quote, avatar, role, company.
 * Three quiet cards. No glow, no scaled middle card, no colored avatars.
 */

import { motion } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
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
    metric: "4 tools → 1",
  },
  {
    quote:
      "We A/B tested our entire ring tree in a single day. That used to take quarters of engineering work and a stack of spreadsheets.",
    name: "Riley Chen",
    role: "Director of Traffic",
    company: "TrafficHub",
    initials: "RC",
    metric: "Quarters → 1 day",
  },
  {
    quote:
      "The compliance toolkit alone justified the move. Auditors stopped pushing back the moment we shared the audit log.",
    name: "Avery Quinn",
    role: "COO",
    company: "HealthDirect",
    initials: "AQ",
    metric: "SOC 2 in days",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Loved by the teams running the network.
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Real operators, real campaigns, real revenue.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
              className="rounded-2xl border border-border/60 bg-card/40 p-6"
            >
              <blockquote className="text-balance text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary/60 text-xs font-medium text-foreground">
                    {t.initials}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{t.metric}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
