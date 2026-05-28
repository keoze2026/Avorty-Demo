"use client";

/**
 * AppIcon — renders a real brand icon for each integration when one exists on
 * simpleicons.org, and falls back to the existing colored-letter tile for the
 * handful of apps that aren't on simpleicons (GoHighLevel, Bandwidth, Plivo,
 * Make).
 *
 * The CDN URL takes a hex color (no `#`). We feed it each app's brand color
 * so the icon renders in its real palette — e.g. Slack-purple, Stripe-indigo.
 */

import { useState } from "react";

import type { IntegrationApp } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Map our internal app ids → simpleicons.org slugs. */
const ICON_SLUGS: Record<string, string> = {
  hubspot: "hubspot",
  twilio: "twilio",
  slack: "slack",
  segment: "segment",
  salesforce: "salesforce",
  zoho: "zoho",
  snowflake: "snowflake",
  bigquery: "googlebigquery",
  postgres: "postgresql",
  "google-analytics": "googleanalytics",
  mixpanel: "mixpanel",
  stripe: "stripe",
  zapier: "zapier",
  discord: "discord",
  teams: "microsoftteams",
  datadog: "datadog",
  // ghl, bandwidth, plivo, make — no simpleicons slug; render letter fallback
};

interface AppIconProps {
  app: IntegrationApp;
  /** Tile size in px (square). Default 36. */
  size?: number;
  className?: string;
}

export function AppIcon({ app, size = 36, className }: AppIconProps) {
  const slug = ICON_SLUGS[app.id];
  const [failed, setFailed] = useState(false);

  // Letter-tile fallback — same look the app had before, kept for apps that
  // aren't on simpleicons OR if the CDN request fails at runtime.
  if (!slug || failed) {
    return (
      <span
        aria-label={app.name}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white",
          className,
        )}
        style={{ width: size, height: size, background: app.color }}
      >
        {app.mark}
      </span>
    );
  }

  const hex = app.color.replace("#", "");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-card",
        className,
      )}
      style={{ width: size, height: size, padding: Math.round(size * 0.18) }}
    >
      {/* Plain img: simpleicons.org CDN, color encoded in URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://cdn.simpleicons.org/${slug}/${hex}`}
        alt={app.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
