"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSecurityStore } from "@/lib/store/security-store";
import { verifyTotpCode } from "@/lib/totp";
import { ROUTES } from "@/lib/constants";
import type { Role } from "@/lib/types";

const DEMO_PRESETS: Array<{ label: string; email: string; role: Role }> = [
  { label: "Admin", email: "avery@vortyx.io", role: "admin" },
  { label: "Buyer", email: "morgan@buyersco.com", role: "buyer" },
  { label: "Publisher", email: "riley@traffichub.com", role: "publisher" },
];

/**
 * Two-step login:
 *   1. Credentials  → email/password (always)
 *   2. 2FA challenge → 6-digit Authenticator code (only if user has 2FA enabled)
 *
 * The 2FA step is a separate phase rather than a modal so it gets its own
 * URL state (well, render state) — the back button still works to bounce
 * the operator back to the credentials step.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const twoFactorEnabled = useSecurityStore((s) => s.twoFactorEnabled);
  const twoFactorSecret = useSecurityStore((s) => s.twoFactorSecret);
  const setTwoFactorVerified = useSecurityStore((s) => s.setTwoFactorVerified);
  const lockReports = useSecurityStore((s) => s.lockReports);

  const [phase, setPhase] = useState<"credentials" | "2fa">("credentials");

  const [email, setEmail] = useState("avery@vortyx.io");
  const [password, setPassword] = useState("vortyx");
  const [role, setRole] = useState<Role>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const [code, setCode] = useState("");

  const finishLogin = () => {
    // Reports PIN re-locks at the start of every login session.
    lockReports();
    router.push(params.get("from") || ROUTES.dashboard);
  };

  const onCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await login(email, password, role);
      if (twoFactorEnabled) {
        // Don't redirect yet — show the 2FA step.
        toast.success("Password accepted — enter your authenticator code");
        setPhase("2fa");
        setCode("");
        return;
      }
      toast.success("Welcome back to Vortyx");
      finishLogin();
    } catch {
      toast.error("Sign in failed — try again");
    } finally {
      setPending(false);
    }
  };

  const onTwoFactorSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!verifyTotpCode(twoFactorSecret ?? "", code)) {
      toast.error("Invalid code — check Google Authenticator and try again");
      return;
    }
    setTwoFactorVerified();
    toast.success("Welcome back to Vortyx");
    finishLogin();
  };

  if (phase === "2fa") {
    return (
      <form onSubmit={onTwoFactorSubmit} className="space-y-5">
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/8 p-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="text-xs">
            <div className="font-semibold text-foreground">Two-factor required</div>
            <p className="text-muted-foreground">
              Open Google Authenticator and enter the current 6-digit code for{" "}
              <span className="font-mono text-foreground">{email}</span>.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totp-login">Authenticator code</Label>
          <Input
            id="totp-login"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            placeholder="123 456"
            className="text-center font-mono text-lg tracking-[0.5em]"
            autoFocus
          />
          <p className="text-[11px] text-muted-foreground">
            Codes refresh every 30 seconds. Lost your device? Contact your admin.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={code.length !== 6}>
          Verify and continue
          <ArrowRight className="h-4 w-4" />
        </Button>

        <button
          type="button"
          onClick={() => setPhase("credentials")}
          className="block w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to sign-in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onCredentialsSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a
            href={ROUTES.forgotPassword}
            className="text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            Forgot?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sign in as</Label>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_PRESETS.map((p) => (
            <button
              type="button"
              key={p.role}
              onClick={() => {
                setEmail(p.email);
                setRole(p.role);
              }}
              className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                role === p.role
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Demo mode — credentials accept any value. Pick a role to see that perspective.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
          </>
        ) : (
          <>
            {twoFactorEnabled ? "Continue" : "Sign in"} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {twoFactorEnabled && (
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-accent" />
          Two-factor authentication is on for this account
        </p>
      )}
    </form>
  );
}
