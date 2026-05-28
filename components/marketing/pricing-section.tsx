"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
    <section id="pricing" className="border-t border-border/40 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Pay for calls that close, not seats
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Volume-based pricing with predictable overage. No per-user nickel-and-diming.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
              className={`relative rounded-2xl border p-7 ${
                plan.popular ? "border-accent/50 bg-card" : "border-border/60 bg-card/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    Most popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-base font-medium text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-medium tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-border/40 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
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
