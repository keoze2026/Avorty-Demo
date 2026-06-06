"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth-store";
import { ROUTES } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";

export function SignupForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    // Light phone check — at least 7 digits, optional leading "+".
    // The real verification happens via SMS code on the next step.
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      toast.error(t("authUI.signup.validationPhoneInvalid"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("authUI.signup.validationPasswordShort"));
      return;
    }
    setPending(true);
    try {
      await signup({ name, email, organization, password, phone: phone.trim() });
      toast.success(
        t("authUI.signup.toastWelcome").replace("{name}", name.split(" ")[0]),
      );
      router.push(ROUTES.dashboard);
    } catch {
      toast.error(t("authUI.signup.toastError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="name">{t("authUI.signup.labelName")}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">{t("authUI.signup.labelOrganization")}</Label>
          <Input
            id="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("authUI.signup.labelEmail")}</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("authUI.signup.labelPhone")}</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("authUI.signup.phonePlaceholder")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">{t("authUI.signup.phoneHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("authUI.signup.labelPassword")}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">{t("authUI.signup.passwordHint")}</p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("authUI.signup.submitting")}
          </>
        ) : (
          <>
            {t("authUI.signup.submit")} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
