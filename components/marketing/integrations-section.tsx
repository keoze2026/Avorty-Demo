"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

const integrations = [
  "Twilio",
  "HubSpot",
  "Salesforce",
  "Zapier",
  "Segment",
  "Snowflake",
  "Stripe",
  "GoHighLevel",
];

export function IntegrationsSection() {
  const { t } = useTranslation();
  return (
    <div className="relative z-20 pb-24 pt-8">
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-lg text-foreground/85 mb-2"
          >
            {t("marketingUI.integrations.tagline")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground mb-16"
          >
            {t("marketingUI.integrations.subtagline")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group cursor-pointer"
          >
            {/* Logo grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-10 items-center justify-items-center transition-all duration-300 group-hover:blur-[2.5px] group-hover:opacity-50">
              {integrations.map((name) => (
                <div key={name} className="text-foreground font-semibold text-xl flex items-center gap-2">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  {name}
                </div>
              ))}
            </div>

            {/* Hover overlay button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="px-5 py-2.5 bg-secondary/80 backdrop-blur-sm border border-border rounded-full text-sm text-foreground/85 flex items-center gap-2">
                {t("marketingUI.integrations.viewAll")}
                <span aria-hidden="true">›</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
