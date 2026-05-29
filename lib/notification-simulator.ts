/**
 * Mock real-time alert source.
 *
 * Until we wire the dashboard to a real socket, this hook simulates the
 * operational events that should pop a banner — TFN cap over, low AHT on
 * the last 10 calls, DNC match, conversion spike, etc.
 *
 * The first event fires ~3s after the hook mounts so the operator sees the
 * banner system right away; subsequent events fire on a jittered interval
 * (~25-45s) so the screen doesn't get spammed.
 */

"use client";

import * as React from "react";

import type { PushNotification } from "@/lib/store/push-notifications-store";
import { pushNotification } from "@/lib/store/push-notifications-store";

type Template = Omit<PushNotification, "id" | "pushedAt">;

const TEMPLATES: Template[] = [
  {
    severity: "warn",
    icon: "phone",
    title: "Low AHT alert on this TFN",
    source: "+18883241868 · Mass Tort — Injury Intake",
    body: "Avg call length over the last 10 calls is 0:32 (target ≥ 1:30). Buyer may be screening early.",
    action: "Investigate",
  },
  {
    severity: "critical",
    icon: "alert",
    title: "This TFN cap is over",
    source: "+18884481136 · Solar Leads — Nationwide",
    body: "Daily cap 80 reached. Routing temporarily paused — 6 calls rerouted to fallback Tier-2.",
    action: "Raise cap",
  },
  {
    severity: "critical",
    icon: "shield",
    title: "TCPA litigator match",
    source: "+12135550190 · Federal DNC scrub",
    body: "Caller flagged on Provider123 (TCPA Litigator). Call blocked before routing.",
    action: "View block",
  },
  {
    severity: "info",
    icon: "spark",
    title: "Health Tier 1 spiked 24%",
    source: "Conversion · last hour",
    body: "3 publishers contributing — DialSurge, Quartz Calls, and Coast Media all up >18%.",
    action: "Scale up",
  },
  {
    severity: "warn",
    icon: "shield",
    title: "VoIP Shield blocked 14 calls",
    source: "Bandwidth.com · past hour",
    body: "Bot-net signatures triggered on the “Repeat caller fraud” list. Costs avoided: $0.14.",
    action: "Review",
  },
  {
    severity: "critical",
    icon: "dollar",
    title: "Buyer Apex hit daily cap",
    source: "Apex Solutions",
    body: "Cap reached at 600 paid calls. Routing now rolling to Tier-2 buyers automatically.",
    action: "Raise cap",
  },
  {
    severity: "info",
    icon: "phone",
    title: "New TFN provisioned",
    source: "+14155550177 · Bandwidth",
    body: "Number purchased and attached to “Health Insurance — Tier 1”. Live in ~30s.",
  },
];

function jitter(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function useNotificationSimulator() {
  React.useEffect(() => {
    let idx = Math.floor(Math.random() * TEMPLATES.length);
    let cancelled = false;

    const fire = () => {
      if (cancelled) return;
      const t = TEMPLATES[idx % TEMPLATES.length];
      idx += 1;
      pushNotification(t);
      // Schedule the next pop somewhere between 25s and 45s out.
      const next = jitter(25_000, 45_000);
      timer = window.setTimeout(fire, next);
    };

    // First banner ~3s after mount so the operator notices the surface.
    let timer = window.setTimeout(fire, 3_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);
}
