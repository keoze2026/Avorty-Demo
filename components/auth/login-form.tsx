"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSecurityStore } from "@/lib/store/security-store";
import { verifyTotpCode } from "@/lib/totp";
import { ROUTES } from "@/lib/constants";

/**
 * Two-step login (admin-only):
 *   1. Credentials  → email/password (always)
 *   2. 2FA challenge → 6-digit Authenticator code (only if user has 2FA enabled)
 *
 * Buyers and publishers do NOT sign in here — they get a role-scoped invite
 * link emailed to them and accept at /invite/[role]/[token]. Keeping the
 * primary login admin-only makes the surface honest and removes the role
 * picker that used to confuse demos.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const twoFactorEnabled = useSecurityStore((s) => s.twoFactorEnabled);
  const twoFactorSecret = useSecurityStore((s) => s.twoFactorSecret);
  const setTwoFactorVerified = useSecurityStore((s) => s.setTwoFactorVerified);
  const lockReports = useSecurityStore((s) => s.lockReports);

  const [phase, setPhase] = useState<"credentials" | "2fa">("credentials");

  const [email, setEmail] = useState("avery@avortyx.io");
  const [password, setPassword] = useState("vortyx");
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
      await login(email, password, "admin");
      if (twoFactorEnabled) {
        // Don't redirect yet — show the 2FA step.
        toast.success("Password accepted — enter your authenticator code");
        setPhase("2fa");
        setCode("");
        return;
      }
      toast.success("Welcome back to Avortyx");
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
    toast.success("Welcome back to Avortyx");
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
            <div className="font-semibold text-foreground">
              {t("login.twoFactor.title")}
            </div>
            <p className="text-muted-foreground">
              {t("login.twoFactor.description")}{" "}
              <span className="font-mono text-foreground">{email}</span>.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="totp-login">{t("login.twoFactor.label")}</Label>
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
            {t("login.twoFactor.hint")}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={code.length !== 6}>
          {t("login.twoFactor.verify")}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <button
          type="button"
          onClick={() => setPhase("credentials")}
          className="block w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("login.twoFactor.back")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onCredentialsSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("login.email")}</Label>
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
          <Label htmlFor="password">{t("login.password")}</Label>
          <a
            href={ROUTES.forgotPassword}
            className="text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            {t("login.forgot")}
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

      <p className="text-[11px] text-muted-foreground">
        {t("login.inviteHint")}
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("login.signingIn")}
          </>
        ) : (
          <>
            {twoFactorEnabled ? t("login.continue") : t("login.signIn")}{" "}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {twoFactorEnabled && (
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-accent" />
          {t("login.twoFactor.enabled")}
        </p>
      )}
    </form>
  );
}
