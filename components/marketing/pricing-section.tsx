"use client";

import { motion } from "framer-motion";
import { Check, DollarSign, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For solo operators kicking the tires on a single campaign.",
    features: [
      "2,000 calls / month",
      "Up to 3 campaigns",
      "Up to 20 tracking numbers",
      "Visual routing builder",
      "Live monitor",
      "Community support",
    ],
    cta: "Start free",
    popular: false,
  },
  {
    name: "Growth",
    price: "$499",
    period: "/month",
    description: "For networks scaling buyers, publishers, and call volume.",
    features: [
      "50,000 calls / month included",
      "Unlimited campaigns & buyers",
      "Unlimited numbers + pools",
      "Real-time marketplace",
      "AI optimization & alerts",
      "Webhooks & integrations",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    name: "Scale",
    price: "Custom",
    description: "For enterprise networks with compliance and uptime stakes.",
    features: [
      "Volume-based pricing",
      "Multi-tenant RBAC + SSO",
      "TCPA, HIPAA, SOC 2 toolkit",
      "BYO carrier / numbering",
      "Dedicated success manager",
      "99.99% uptime SLA",
      "On-prem & private cloud",
    ],
    cta: "Talk to sales",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 border-t border-border/40 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent">
            <DollarSign className="h-4 w-4" />
            <span className="font-mono uppercase tracking-wider">Pricing</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            Pay for calls that close, not seats
          </h2>
          <p className="mt-4 text-muted-foreground">
            Volume-based pricing with predictable overage. No per-user nickel-and-diming.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-accent bg-[#111827] shadow-2xl shadow-accent/10"
                  : "border-border/60 bg-[#0A0F1C]"
              }`}
            >
              {plan.popular && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--vortyx-bright), transparent 40%, var(--vortyx-deep))",
                      opacity: 0.25,
                      mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: 1,
                    }}
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-accent-foreground bg-accent shadow-lg shadow-accent/30">
                      <Sparkles className="h-3 w-3" />
                      Most popular
                    </span>
                  </div>
                </>
              )}

              <div className="text-center">
                <h3 className="font-mono text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="font-mono text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  className={`w-full ${plan.popular ? "" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                  variant={plan.popular ? "default" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Volume discounts kick in automatically. Overage billed per-call, not per-seat.
        </p>
      </div>
    </section>
  );
}
