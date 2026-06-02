"use client";

/**
 * Role-scoped invite acceptance form.
 *
 * Buyers and publishers don't sign in at /login. They receive an emailed link
 * like /invite/buyer/<token> or /invite/publisher/<token>, land here, set a
 * password, and are dropped into the app with the role baked in. This keeps
 * the primary /login surface admin-only and makes onboarding feel curated
 * instead of like a self-serve free-for-all.
 *
 * The "token" is decorative in the demo build — it picks a mock inviter and
 * email from a small fixture map so the page reads as real.
 */

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth-store";
import { ROUTES } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";

interface Invite {
  email: string;
  inviterName: string;
  inviterEmail: string;
  organization: string;
}

/** Pretend-decoded tokens — the demo invite email links here. */
const DEMO_TOKENS: Record<string, Invite> = {
  "buyer-demo": {
    email: "morgan@buyersco.com",
    inviterName: "Avery Chen",
    inviterEmail: "avery@vortyx.io",
    organization: "Vortyx",
  },
  "publisher-demo": {
    email: "riley@traffichub.com",
    inviterName: "Avery Chen",
    inviterEmail: "avery@vortyx.io",
    organization: "Vortyx",
  },
};

function decodeToken(role: "buyer" | "publisher", token: string): Invite {
  // Try a perfect match first, then fall back to a role-scoped default so
  // any token in the URL still resolves to a sane preview.
  return (
    DEMO_TOKENS[token] ??
    DEMO_TOKENS[`${role}-demo`] ?? {
      email: `${role}@example.com`,
      inviterName: "Vortyx team",
      inviterEmail: "team@vortyx.io",
      organization: "Vortyx",
    }
  );
}

interface InviteFormProps {
  role: "buyer" | "publisher";
  token: string;
}

export function InviteForm({ role, token }: InviteFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);

  const invite = decodeToken(role, token);

  const [email] = useState(invite.email);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const roleLabel =
    role === "buyer"
      ? t("authUI.invite.roleBuyer")
      : t("authUI.invite.rolePublisher");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    if (password.length < 8) {
      toast.error(t("authUI.invite.validationPasswordShort"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("authUI.invite.validationPasswordsDontMatch"));
      return;
    }
    setPending(true);
    try {
      await login(email, password, role);
      toast.success(
        t("authUI.invite.toastWelcome")
          .replace("{org}", invite.organization)
          .replace("{role}", roleLabel),
      );
      router.push(ROUTES.dashboard);
    } catch {
      toast.error(t("authUI.invite.toastError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-lg border border-accent/30 bg-accent/8 p-3 text-xs">
        <div className="font-semibold text-foreground">
          {t("authUI.invite.bannerInvited").replace("{role}", roleLabel)}
        </div>
        <p className="mt-0.5 text-muted-foreground">
          <span className="font-medium text-foreground">{invite.inviterName}</span>{" "}
          {t("authUI.invite.bannerInviterMiddle")}{" "}
          <span className="font-medium text-foreground">{invite.organization}</span>{" "}
          {t("authUI.invite.bannerInviterInvited")}{" "}
          <span className="font-mono text-foreground">{invite.email}</span>{" "}
          {t("authUI.invite.bannerInviterEnd")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-email">{t("authUI.invite.labelEmail")}</Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          readOnly
          className="cursor-not-allowed bg-secondary/40"
        />
        <p className="text-[10px] text-muted-foreground">
          {t("authUI.invite.emailHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-pwd">{t("authUI.invite.labelCreatePassword")}</Label>
        <div className="relative">
          <Input
            id="invite-pwd"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword
                ? t("authUI.invite.hidePassword")
                : t("authUI.invite.showPassword")
            }
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-confirm">{t("authUI.invite.labelConfirmPassword")}</Label>
        <Input
          id="invite-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("authUI.invite.submitting")}
          </>
        ) : (
          <>
            {t("authUI.invite.submit")} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground">
        {t("authUI.invite.legalBefore")} {invite.organization}
        {t("authUI.invite.legalAfter")}
      </p>
    </form>
  );
}
