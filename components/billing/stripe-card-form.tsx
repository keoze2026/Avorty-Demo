"use client";

/**
 * Stripe card form — collects card details via Stripe Elements, creates a
 * PaymentIntent on the backend, then confirms the payment client-side. Used
 * inside the Recharge Balance flow when the user picks "Bank card".
 *
 * Stripe.js handles PCI-compliant card collection — the card number / CVV
 * never touch our codebase. We pass the resulting `PaymentMethod` reference
 * to `stripe.confirmCardPayment(clientSecret, …)` and Stripe redirects the
 * user through any required 3D Secure challenge automatically.
 */

import { useEffect, useMemo, useState } from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { billingService } from "@/lib/api/services/billing.service";
import { getStripe, isStripeConfigured } from "@/lib/api/stripe";

/* ─── Outer wrapper — provides the Stripe Elements context ─────────────── */

interface StripeCardFormProps {
  /** Amount in major units (e.g. dollars, not cents). */
  amount: number;
  disabled?: boolean;
  /** Called after a successful payment. Use for refresh / redirect. */
  onSuccess?: (paymentIntentId: string) => void;
}

export function StripeCardForm(props: StripeCardFormProps) {
  // Memoize the Stripe promise so we don't trigger Elements remounts.
  const stripePromise = useMemo(() => getStripe(), []);

  if (!isStripeConfigured) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-secondary/20 px-4 py-6 text-center text-xs text-muted-foreground">
        Card payments require <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your env.
        Add it to <code className="font-mono">.env.local</code> and restart the dev server.
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#818CF8",
            colorBackground: "#0f1123",
            colorText: "#e5e7eb",
            colorDanger: "#f43f5e",
            fontFamily: "var(--font-sans), system-ui, sans-serif",
            borderRadius: "8px",
          },
        },
      }}
    >
      <CardFormInner {...props} />
    </Elements>
  );
}

/* ─── Inner form — has access to the Elements + Stripe instances ───────── */

function CardFormInner({ amount, disabled, onSuccess }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const cardOptions: StripeCardElementOptions = useMemo(
    () => ({
      hidePostalCode: false,
      style: {
        base: {
          iconColor: "#a3a3a3",
          color: "#e5e7eb",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontSize: "14px",
          fontSmoothing: "antialiased",
          "::placeholder": { color: "#9ca3af" },
        },
        invalid: { color: "#f43f5e", iconColor: "#f43f5e" },
      },
    }),
    [],
  );

  const submit = async () => {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    if (amount <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (cardError) {
      toast.error(cardError);
      return;
    }
    setSubmitting(true);
    try {
      // 1) Create the PaymentIntent on the backend.
      const intent = await billingService.createDeposit({ amount });
      if (!intent.clientSecret) {
        throw new Error("Backend did not return a client_secret");
      }
      // 2) Confirm the card payment with Stripe.js. Stripe handles 3DS
      //    automatically — `handleActions: true` (default) opens the
      //    auth challenge in an iframe and resolves once complete.
      const result = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: { card },
      });
      if (result.error) {
        toast.error(result.error.message ?? "Card payment failed");
        return;
      }
      const pi = result.paymentIntent;
      if (pi?.status === "succeeded") {
        toast.success(`$${amount.toFixed(2)} charged — balance updates shortly.`);
        card.clear();
        onSuccess?.(pi.id);
      } else if (pi?.status === "processing") {
        toast.success("Payment processing — balance will update once cleared.");
        onSuccess?.(pi.id);
      } else {
        toast.error(`Payment status: ${pi?.status ?? "unknown"}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't process card payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Card details</Label>
        <div className="rounded-md border border-border bg-secondary/40 px-3 py-2.5">
          <CardElement
            options={cardOptions}
            onReady={() => setCardReady(true)}
            onChange={(e) => setCardError(e.error?.message ?? null)}
          />
        </div>
        {cardError && (
          <p className="text-[11px] text-destructive">{cardError}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-muted-foreground">
          Card details secured by Stripe. Avortyx never sees your card number.
        </p>
        <Button
          onClick={submit}
          disabled={
            !stripe || !elements || !cardReady || submitting || disabled || amount <= 0
          }
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Charging…
            </>
          ) : (
            <>Pay ${amount.toFixed(2)}</>
          )}
        </Button>
      </div>
    </div>
  );
}
