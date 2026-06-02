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

import { useTranslation } from "@/hooks/use-translation";
import type { PushNotification } from "@/lib/store/push-notifications-store";
import { pushNotification } from "@/lib/store/push-notifications-store";

type Template = Omit<PushNotification, "id" | "pushedAt">;

interface TemplateKeys {
  severity: PushNotification["severity"];
  icon: PushNotification["icon"];
  /** i18n key root, e.g. "notificationsUI.simulator.lowAht" */
  root: string;
  /** Whether the action label key exists for this template. */
  hasAction: boolean;
  /** Optional token replacements for title/body. */
  tokens?: Record<string, string>;
}

const TEMPLATE_KEYS: TemplateKeys[] = [
  {
    severity: "warn",
    icon: "phone",
    root: "notificationsUI.simulator.lowAht",
    hasAction: true,
  },
  {
    severity: "critical",
    icon: "alert",
    root: "notificationsUI.simulator.tfnCapOver",
    hasAction: true,
  },
  {
    severity: "critical",
    icon: "shield",
    root: "notificationsUI.simulator.tcpaMatch",
    hasAction: true,
  },
  {
    severity: "info",
    icon: "spark",
    root: "notificationsUI.simulator.healthSpike",
    hasAction: true,
  },
  {
    severity: "warn",
    icon: "shield",
    root: "notificationsUI.simulator.voipShield",
    hasAction: true,
    tokens: { "{n}": "14", "{amount}": "$0.14" },
  },
  {
    severity: "critical",
    icon: "dollar",
    root: "notificationsUI.simulator.buyerCap",
    hasAction: true,
  },
  {
    severity: "info",
    icon: "phone",
    root: "notificationsUI.simulator.newTfn",
    hasAction: false,
  },
];

function interpolate(input: string, tokens?: Record<string, string>) {
  if (!tokens) return input;
  return Object.entries(tokens).reduce(
    (acc, [token, value]) => acc.split(token).join(value),
    input,
  );
}

function jitter(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function useNotificationSimulator() {
  const { t } = useTranslation();

  // Hold the latest `t` in a ref so the interval closure always reads from the
  // current locale without forcing a remount when the language switches.
  const tRef = React.useRef(t);
  React.useEffect(() => {
    tRef.current = t;
  }, [t]);

  React.useEffect(() => {
    let idx = Math.floor(Math.random() * TEMPLATE_KEYS.length);
    let cancelled = false;

    const fire = () => {
      if (cancelled) return;
      const tNow = tRef.current;
      const k = TEMPLATE_KEYS[idx % TEMPLATE_KEYS.length];
      idx += 1;
      const template: Template = {
        severity: k.severity,
        icon: k.icon,
        title: interpolate(tNow(`${k.root}.title`), k.tokens),
        source: tNow(`${k.root}.source`),
        body: interpolate(tNow(`${k.root}.body`), k.tokens),
        ...(k.hasAction ? { action: tNow(`${k.root}.action`) } : {}),
      };
      pushNotification(template);
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
