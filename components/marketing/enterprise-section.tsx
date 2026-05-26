"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Building2,
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
    <section id="enterprise" className="py-24 border-t border-border/40 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent">
            <Building2 className="h-4 w-4" />
            <span className="font-mono uppercase tracking-wider">Enterprise</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            Powering the networks regulators ask about
          </h2>
          <p className="mt-4 text-muted-foreground">
            Vortyx is built for scale, compliance, and the conversation you have with security on the way in.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {enterpriseFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              className="group relative rounded-xl border border-border/60 bg-[#111827] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-accent/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-mono text-sm font-semibold">{feature.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-accent/40 bg-gradient-to-b from-accent/10 to-transparent p-8 text-center sm:p-12">
          <h3 className="font-mono text-xl font-bold">Built to land in your perimeter</h3>
          <p className="mt-4 text-muted-foreground">
            Talk to our team about deployment topology, compliance scope, and onboarding. We respond same-day.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg">Talk to sales</Button>
            <Button size="lg" variant="outline">
              Request a demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
