"use client";

import { motion } from "framer-motion";
import { Activity, Check, ChevronRight, TrendingUp, Zap } from "lucide-react";

const integrations = [
  { name: "Twilio", isConnected: true, selected: true, icon: "◇" },
  { name: "HubSpot", isConnected: true, selected: false, icon: "◉" },
  { name: "Salesforce", isConnected: true, selected: false, icon: "◈" },
  { name: "Zapier", isConnected: false, selected: false, icon: "○" },
  { name: "Segment", isConnected: true, selected: false, icon: "◎" },
  { name: "GoHighLevel", isConnected: false, selected: false, icon: "○" },
];

export function CodeSection() {
  return (
    <div id="code" className="relative z-20 py-40">
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 5%, transparent) 0%, transparent 100%)",
        }}
      />
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted-foreground text-sm">AI-powered intelligence</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground max-w-3xl mb-8 font-medium leading-[1.1] tracking-tight"
          >
            AI optimization that learns your network
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-md mb-8"
          >
            <span className="text-foreground font-medium">Vortyx AI.</span> Suggests where to
            scale, pause, rebalance, or alert — automatically based on your network&apos;s
            performance patterns.
          </motion.p>

          {/* Learn more button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            type="button"
            className="px-5 py-2.5 bg-secondary text-foreground/85 rounded-lg border border-border hover:bg-secondary/80 transition-colors text-sm flex items-center gap-2 mb-16"
          >
            Explore AI features
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Integration dropdown mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center mb-24"
          >
            <div
              style={{
                perspective: "900px",
                userSelect: "none",
                WebkitUserSelect: "none",
                width: "100%",
                maxWidth: "720px",
                position: "relative",
              }}
            >
              <div
                style={{
                  transformOrigin: "top",
                  willChange: "transform",
                  transform: "translateY(0%) rotateX(30deg) scale(1.15)",
                  position: "relative",
                }}
              >
                {/* Glass overlay effect */}
                <div
                  style={{
                    border: "1px solid color-mix(in oklab, var(--border) 60%, transparent)",
                    background:
                      "linear-gradient(color-mix(in oklab, var(--foreground) 8%, transparent) 40%, color-mix(in oklab, var(--background) 90%, transparent) 100%)",
                    borderRadius: "8px",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    boxShadow:
                      "inset 0 1.503px 5.261px rgba(255, 255, 255, 0.04), inset 0 -0.752px 0.752px rgba(255, 255, 255, 0.1)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                <div
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, var(--background) 100%)",
                    height: "80%",
                    position: "absolute",
                    bottom: "-2px",
                    left: "-180px",
                    right: "-180px",
                    pointerEvents: "none",
                    zIndex: 11,
                  }}
                />

                {/* Input field */}
                <div className="bg-secondary/50 border border-border rounded-t-xl px-5 py-4">
                  <span className="text-muted-foreground italic">Route to buyer...</span>
                </div>

                {/* Dropdown options */}
                <div className="bg-card/80 border border-t-0 border-border rounded-b-xl py-1">
                  {integrations.map((integration, index) => (
                    <div
                      key={integration.name}
                      style={
                        integration.selected
                          ? {
                              transform: "scale(1.04) rotateX(17deg)",
                              background:
                                "linear-gradient(color-mix(in oklab, var(--secondary) 85%, transparent) 0%, color-mix(in oklab, var(--secondary) 70%, transparent) 100%)",
                              borderRadius: "6px",
                              height: "48px",
                              position: "relative",
                              boxShadow:
                                "inset 0 -2.75px 4.75px rgba(255, 255, 255, 0.14), inset 0 -0.752px 0.752px rgba(255, 255, 255, 0.1), 0 54px 73px 3px rgba(0, 0, 0, 0.5)",
                              zIndex: 20,
                              marginLeft: "-12px",
                              marginRight: "-12px",
                            }
                          : { opacity: 1 - index * 0.15, height: "42px" }
                      }
                    >
                      <div
                        className="flex items-center justify-between h-full"
                        style={{ paddingLeft: "24px", paddingRight: "24px", gap: "12px" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-lg">
                            {integration.icon}
                          </span>
                          <span
                            className={
                              integration.selected
                                ? "text-foreground font-medium"
                                : "text-foreground/85"
                            }
                          >
                            {integration.name}
                          </span>
                          {integration.isConnected && (
                            <span className="text-xs bg-[color:var(--success)]/20 text-[color:var(--success)] px-2 py-0.5 rounded">
                              Connected
                            </span>
                          )}
                        </div>
                        {integration.selected && <Check className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom divider with two columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left column */}
              <div className="border-t border-r border-b border-border/60 pt-12 pr-12 pb-16">
                <h3 className="text-foreground/90 font-medium text-xl mb-3">
                  Smart routing suggestions
                </h3>
                <p className="text-muted-foreground text-base mb-8">
                  Vortyx analyzes your network patterns and suggests optimizations to maximize
                  revenue and buyer match rates.
                </p>

                <div className="bg-card/30 border border-border/60 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground text-sm">
                      AI <span className="text-foreground/85">Recommendation</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-muted-foreground/70 text-sm w-20">Action</span>
                    <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm bg-accent">
                      <TrendingUp className="w-3 h-3 text-accent-foreground" />
                      <span className="text-accent-foreground">Increase cap</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-muted-foreground/70 text-sm w-20">Buyer</span>
                    <span className="text-foreground/85 text-sm">Apex Insurance</span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-muted-foreground/70 text-sm w-20">Impact</span>
                    <span className="text-[color:var(--success)] text-sm">
                      +$2,400/day estimated
                    </span>
                  </div>

                  <div className="bg-secondary/40 rounded-lg p-4 ml-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-[color:var(--success)]" />
                      <span className="text-foreground/85 text-sm font-medium">
                        Pattern detected
                      </span>
                    </div>

                    <p className="text-muted-foreground text-xs mb-2">Why this was suggested</p>
                    <p className="text-muted-foreground text-sm mb-4">
                      Apex Insurance has maintained 98% acceptance rate over the past 48 hours with
                      consistent conversion quality.
                    </p>

                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 bg-secondary/70 hover:bg-secondary/90 text-foreground/85 text-sm py-2.5 rounded-md transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Apply suggestion
                    </button>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="border-t border-b border-border/60 pt-12 pl-12 pb-16">
                <h3 className="text-foreground/90 font-medium text-xl mb-3">Vortyx SDK</h3>
                <p className="text-muted-foreground text-base mb-8">
                  Every Vortyx capability is reachable from a single typed SDK — and every event
                  lands on your webhook within milliseconds.
                </p>

                <div className="bg-card/30 border border-border/60 rounded-xl p-5 font-mono text-sm">
                  <p className="text-muted-foreground/60 mb-3">// @vortyx/sdk</p>
                  <div className="space-y-1 mb-6">
                    <p>
                      <span className="text-accent">import</span>
                      <span className="text-muted-foreground"> {"{ "}</span>
                      <span className="text-foreground/85">createClient</span>
                      <span className="text-muted-foreground">{" }"} </span>
                      <span className="text-accent">from</span>
                      <span className="text-[color:var(--success)]">
                        {" "}
                        &apos;@vortyx/sdk&apos;
                      </span>
                    </p>
                    <p className="mt-2">
                      <span className="text-accent">const</span>
                      <span className="text-foreground/85"> vortyx </span>
                      <span className="text-muted-foreground">= </span>
                      <span className="text-foreground/85">createClient</span>
                      <span className="text-muted-foreground">({"{"}</span>
                    </p>
                    <p className="pl-4">
                      <span className="text-foreground/70">workspace</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="text-[color:var(--success)]">
                        &apos;tier-one-health&apos;
                      </span>
                      <span className="text-muted-foreground">,</span>
                    </p>
                    <p className="pl-4">
                      <span className="text-foreground/70">region</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="text-[color:var(--success)]">&apos;auto&apos;</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{"})"}</span>
                    </p>
                  </div>

                  <div className="bg-secondary/40 rounded-lg p-4">
                    <p className="text-muted-foreground/60 text-xs mb-2">// Route incoming call</p>
                    <p>
                      <span className="text-accent">const</span>
                      <span className="text-foreground/85"> decision </span>
                      <span className="text-muted-foreground">= </span>
                      <span className="text-accent">await</span>
                      <span className="text-foreground/85"> vortyx.</span>
                      <span className="text-foreground/85">route</span>
                      <span className="text-muted-foreground">(call)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
