"use client";

/**
 * Contact section — sits above the footer on the marketing site. Visitors
 * fill in name + email + message; submit POSTs to /api/support/chat which
 * opens a support session, pings the admin team via Telegram, and emails
 * the support inbox. The team replies via Telegram or email and the
 * response lands in the visitor's Gmail — there is no in-app reply UI
 * yet, so we discard the returned `sessionId` for now. (When the chat
 * history UI is built, we'll persist it to localStorage instead.)
 *
 * The visible `support@keozx.com` link in the form acts as a fallback if
 * the visitor would rather write from their own email client directly.
 */

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/http";
import { friendlyErrorMessage } from "@/lib/api/errors";
import { supportService } from "@/lib/api/services/support.service";

const SUPPORT_EMAIL = "support@keozx.com";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in name, email, and message.");
      return;
    }

    setPending(true);
    try {
      await supportService.startChat({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      // Surface backend rate-limit friendly. Everything else routes through
      // the generic friendly-message helper which sanitizes HTML/traceback
      // bodies and maps status codes to human-readable defaults.
      const friendly =
        err instanceof ApiError && err.status === 429
          ? "You've sent a few messages already — please wait a minute and try again."
          : friendlyErrorMessage(err, "Couldn't send your message. Please try again or email us directly.");
      toast.error(friendly);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      id="contact"
      className="relative overflow-hidden rounded-2xl border border-border/50 p-6 sm:p-8"
    >
      {/* Heading */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Mail className="h-3 w-3" />
          Get in touch
        </span>
        <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Talk to our team
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Have a question, a partnership in mind, or need support? Send us a
          message and we&apos;ll get back within one business day.
        </p>
      </div>

      {/* Form panel (separate inner frame so the form itself reads as its
          own focused unit inside the larger card) */}
      <div>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h3 className="text-base font-semibold text-foreground">
                Message sent
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Thanks — we&apos;ve received your message and will reply within
                one business day.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setMessage("");
                }}
                className="mt-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldShell label="Name" htmlFor="contact-name">
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </FieldShell>
                <FieldShell label="Email" htmlFor="contact-email">
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </FieldShell>
              </div>

              <FieldShell label="How can we help?" htmlFor="contact-message">
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A few sentences on what you're looking for."
                  required
                  className="w-full resize-y bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
              </FieldShell>

              <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
                <p className="text-[11px] text-muted-foreground">
                  Prefer email?{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-accent hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  FieldShell — a uniform input frame with a label inside, so every    */
/*  field reads the same regardless of the underlying input element.    */
/*  Keeps the form visually clean with a single thin border per field.  */
/* ─────────────────────────────────────────────────────────────────── */

function FieldShell({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 transition-colors focus-within:border-accent/50"
    >
      <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
