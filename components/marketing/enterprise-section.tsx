"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Cog,
  FileLock2,
  Globe,
  Headphones,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const enterpriseFeatures = [
  {
    icon: ShieldCheck,
    title: "SOC 2 Type II",
    description: "Continuous controls, annual audit, evidence on request.",
  },
  {
    icon: FileLock2,
    title: "TCPA & HIPAA toolkit",
    description: "Consent capture, healthcare-tier isolation, audit-ready retention.",
  },
  {
    icon: Users,
    title: "Multi-tenant RBAC + SSO",
    description: "Org hierarchies, granular permissions, SAML / OIDC out of the box.",
  },
  {
    icon: Globe,
    title: "99.99% uptime SLA",
    description: "Multi-region failover. Penalties contractually backed.",
  },
  {
    icon: Cog,
    title: "BYO carrier & numbering",
    description: "Plug your existing SIP / DID provider into the routing plane.",
  },
  {
    icon: Activity,
    title: "Real-time data export",
    description: "Streaming exports to Snowflake, BigQuery, S3, or your own webhook.",
  },
  {
    icon: Headphones,
    title: "Dedicated success",
    description: "Named engineer + success manager. Quarterly business reviews.",
  },
  {
    icon: Lock,
    title: "Private cloud / on-prem",
    description: "Ship Vortyx into your own VPC. Same product, your perimeter.",
  },
];

export function EnterpriseSection() {
  return (
    <section id="enterprise" className="border-t border-border/40 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Powering the networks regulators ask about
          </h2>
          <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
            Vortyx is built for scale, compliance, and the conversation you have with security on
            the way in.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {enterpriseFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.03, duration: 0.35 }}
              className="rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:bg-card"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary/60 text-muted-foreground">
                <feature.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-sm font-medium text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-border/60 bg-card/40 p-8 text-center sm:p-10">
          <h3 className="text-xl font-medium tracking-tight text-foreground">
            Built to land in your perimeter
          </h3>
          <p className="mt-3 text-balance text-sm text-muted-foreground">
            Talk to our team about deployment topology, compliance scope, and onboarding. We
            respond same-day.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-10 px-5 text-sm">
              Talk to sales
            </Button>
            <Button size="lg" variant="outline" className="h-10 px-5 text-sm">
              Request a demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
