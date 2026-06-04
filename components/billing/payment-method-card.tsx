"use client";

/**
 * Visual credit-card mockup — the showpiece of the billing surface.
 * Renders a tilt-on-hover gradient card with brand mark, masked number,
 * chip artwork, expiry, and cardholder.
 */

import { motion } from "framer-motion";
import { Pencil, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PAYMENT_METHOD } from "@/lib/mock/billing";
import { useTranslation } from "@/hooks/use-translation";

const BRAND_LABEL: Record<string, string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "AMEX",
  discover: "Discover",
};

export function PaymentMethodCard() {
  const { t } = useTranslation();
  const pm = MOCK_PAYMENT_METHOD;
  const brand = BRAND_LABEL[pm.brand] ?? "Card";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{t("toolsUI.billing.payment.title")}</CardTitle>
        <Button variant="outline" size="sm">
          <Pencil className="h-3 w-3" /> {t("toolsUI.billing.payment.update")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* The card */}
        <motion.div
          whileHover={{ rotate: -1, scale: 1.01 }}
          transition={{ duration: 0.25 }}
          className="relative aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-2xl p-5 text-white shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #050608 0%, #2A3499 35%, #3A4BC4 75%, #5266E0 110%)",
          }}
        >
          {/* Texture / highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(ellipse 40% 30% at 100% 100%, rgba(255,255,255,0.12), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(115deg, transparent 0%, transparent 38%, rgba(255,255,255,0.12) 50%, transparent 62%)",
            }}
          />

          {/* Top row: brand + chip */}
          <div className="relative flex items-start justify-between">
            <span className="font-sans text-base font-semibold tracking-wide drop-shadow">Avortyx</span>
            <span className="font-sans text-base font-bold italic tracking-wider opacity-90">{brand}</span>
          </div>

          {/* Chip + RFID-like glyph */}
          <div className="relative mt-6 flex items-center gap-3">
            <div
              className="h-8 w-11 rounded-md"
              style={{
                background:
                  "linear-gradient(135deg, #f9d877, #d49b3b), repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 6px)",
                backgroundBlendMode: "overlay",
              }}
            />
            <svg viewBox="0 0 24 24" className="h-6 w-6 -rotate-90 opacity-80" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10c2-2 5-2 7 0" strokeLinecap="round" />
              <path d="M3 14c4-3 9-3 13 0" strokeLinecap="round" />
              <path d="M3 18c6-4 13-4 19 0" strokeLinecap="round" />
            </svg>
          </div>

          {/* Number */}
          <div className="relative mt-5 font-mono text-xl tracking-[0.2em] sm:text-2xl">
            <span className="opacity-90">••••</span>{" "}
            <span className="opacity-90">••••</span>{" "}
            <span className="opacity-90">••••</span>{" "}
            <span className="font-semibold">{pm.last4}</span>
          </div>

          {/* Bottom row */}
          <div className="relative mt-4 flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-widest opacity-70">{t("toolsUI.billing.payment.cardholder")}</div>
              <div className="font-mono text-sm font-semibold tracking-wide">{pm.cardholderName}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest opacity-70">{t("toolsUI.billing.payment.expires")}</div>
              <div className="font-mono text-sm font-semibold">
                {pm.expMonth.toString().padStart(2, "0")}/{(pm.expYear % 100).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security note */}
        <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-accent" />
          {t("toolsUI.billing.payment.securityNote")}
        </p>
      </CardContent>
    </Card>
  );
}
