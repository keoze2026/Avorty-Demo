/**
 * Singleton Stripe.js loader.
 *
 * `loadStripe` returns a promise that resolves to the global Stripe object.
 * The library is meant to be loaded once per page and shared across every
 * Elements provider — so we cache the promise at module scope and hand the
 * same one to every consumer.
 *
 * The publishable key is a build-time `NEXT_PUBLIC_*` so Next.js inlines it
 * into the client bundle (see `lib/api/env.ts` for the literal-reference
 * gotcha that breaks dynamic process.env lookups).
 */

import { loadStripe, type Stripe } from "@stripe/stripe-js";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

let cachedPromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!PUBLISHABLE_KEY) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set — card payments will be disabled.",
      );
    }
    return Promise.resolve(null);
  }
  if (!cachedPromise) cachedPromise = loadStripe(PUBLISHABLE_KEY);
  return cachedPromise;
}

export const isStripeConfigured = PUBLISHABLE_KEY.length > 0;
