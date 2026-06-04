"use client";

import * as React from "react";
import {
  Check,
  Copy,
  KeyRound,
  Lock,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSecurityStore } from "@/lib/store/security-store";
import {
  buildOtpauthUrl,
  formatSecretForDisplay,
  generateTotpSecret,
  verifyTotpCode,
} from "@/lib/totp";
import { cn } from "@/lib/utils";

export function SecuritySection() {
  return (
    <div className="space-y-4">
      <TwoFactorCard />
      <ReportsPinCard />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Google Authenticator / TOTP                                         */
/* ─────────────────────────────────────────────────────────────────── */

function TwoFactorCard() {
  const { t } = useTranslation();
  const enabled = useSecurityStore((s) => s.twoFactorEnabled);
  const secret = useSecurityStore((s) => s.twoFactorSecret);
  const enable2FA = useSecurityStore((s) => s.enable2FA);
  const disable2FA = useSecurityStore((s) => s.disable2FA);
  const user = useAuthStore((s) => s.user);

  const [setupOpen, setSetupOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-accent" />
          {t("settings.securitySection.twoFactor")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("settings.securitySection.twoFactorRequire")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled && !setupOpen ? (
          <div className="flex items-center justify-between rounded-lg border border-[oklch(0.78_0.18_155)]/30 bg-[oklch(0.78_0.18_155)]/8 p-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[oklch(0.78_0.18_155)]/15 text-[oklch(0.78_0.18_155)]">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium">2FA is on</div>
                <div className="text-[11px] text-muted-foreground">
                  Codes are checked from Google Authenticator on every sign-in.
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                disable2FA();
                toast.success(t("settings.securitySection.twoFactorDisabled"));
              }}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("settings.securitySection.disable")}
            </Button>
          </div>
        ) : !setupOpen ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
                <Smartphone className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium">{t("settings.securitySection.addGoogleAuth")}</div>
                <div className="text-[11px] text-muted-foreground">
                  {t("settings.securitySection.addGoogleAuthHint")}
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => setSetupOpen(true)}>
              <ScanLine className="h-3.5 w-3.5" />
              {t("settings.securitySection.setup")}
            </Button>
          </div>
        ) : (
          <TwoFactorSetup
            accountEmail={user?.email ?? "user@avortyx.io"}
            currentSecret={secret}
            onCancel={() => setSetupOpen(false)}
            onConfirm={(s) => {
              enable2FA(s);
              setSetupOpen(false);
              toast.success("Two-factor authentication enabled");
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface TwoFactorSetupProps {
  accountEmail: string;
  currentSecret: string | null;
  onCancel: () => void;
  onConfirm: (secret: string) => void;
}

function TwoFactorSetup({
  accountEmail,
  currentSecret,
  onCancel,
  onConfirm,
}: TwoFactorSetupProps) {
  // Generate exactly once per setup — re-rendering the parent should not
  // shuffle the QR on the user.
  const [secret] = React.useState(currentSecret ?? generateTotpSecret());
  const [code, setCode] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const otpauthUrl = React.useMemo(
    () => buildOtpauthUrl({ account: accountEmail, secret }),
    [accountEmail, secret],
  );
  // Public QR code generator — no dependency, scannable by any TOTP app.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(otpauthUrl)}`;

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("Secret copied");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  };

  const confirm = () => {
    if (!verifyTotpCode(secret, code)) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    onConfirm(secret);
  };

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-secondary/15 p-4 md:grid-cols-[240px_1fr]">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-lg bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="Google Authenticator setup QR code"
            width={240}
            height={240}
            className="h-[240px] w-[240px]"
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          Scan with Google Authenticator
        </span>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Or enter this secret manually</Label>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 rounded-md border border-border bg-card px-2 py-1.5 font-mono text-xs tracking-wider">
              {formatSecretForDisplay(secret)}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              onClick={copySecret}
              aria-label="Copy secret"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="totp-code" className="text-xs">
            Confirm with a 6-digit code
          </Label>
          <Input
            id="totp-code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            maxLength={6}
            placeholder="123 456"
            className="font-mono tracking-[0.4em]"
            autoComplete="one-time-code"
          />
          <p className="text-[11px] text-muted-foreground">
            Open Google Authenticator and type the current 6-digit code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={confirm} disabled={code.length !== 6}>
            Enable 2FA
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Reports PIN                                                         */
/* ─────────────────────────────────────────────────────────────────── */

function ReportsPinCard() {
  const { t } = useTranslation();
  const reportsPin = useSecurityStore((s) => s.reportsPin);
  const setReportsPin = useSecurityStore((s) => s.setReportsPin);
  const clearReportsPin = useSecurityStore((s) => s.clearReportsPin);

  const [editing, setEditing] = React.useState(false);
  const [pin, setPin] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const onSave = () => {
    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    if (pin !== confirm) {
      toast.error("PINs don't match");
      return;
    }
    setReportsPin(pin);
    setEditing(false);
    setPin("");
    setConfirm("");
    toast.success(t("settings.securitySection.pinSaved"));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4 text-accent" />
          {t("settings.securitySection.reportsPin")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("settings.securitySection.reportsPinFullDescription")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {reportsPin && !editing ? (
          <div className="flex items-center justify-between rounded-lg border border-[oklch(0.78_0.18_155)]/30 bg-[oklch(0.78_0.18_155)]/8 p-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[oklch(0.78_0.18_155)]/15 text-[oklch(0.78_0.18_155)]">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium">{t("settings.securitySection.pinIsSet")}</div>
                <div className="text-[11px] text-muted-foreground">
                  {t("settings.securitySection.pinIsSetHint")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-8"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {t("settings.securitySection.change")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearReportsPin();
                  toast.success(t("settings.securitySection.pinRemoved"));
                }}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : !editing ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium">No PIN set</div>
                <div className="text-[11px] text-muted-foreground">
                  Anyone with the session can browse historical reports.
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => setEditing(true)}>
              Set PIN
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-border bg-secondary/15 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <PinInput
                id="pin-new"
                label={
                  reportsPin
                    ? t("settings.securitySection.newPinLabel")
                    : t("settings.securitySection.choosePinLabel")
                }
                value={pin}
                onChange={setPin}
              />
              <PinInput
                id="pin-confirm"
                label={t("settings.securitySection.confirmPin")}
                value={confirm}
                onChange={setConfirm}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pick a code different from your phone unlock. Forgot it? Disable
              and re-set from here.
            </p>
            <div className="flex items-center gap-2">
              <Button onClick={onSave} disabled={pin.length !== 4 || confirm.length !== 4}>
                {t("settings.securitySection.savePin")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setPin("");
                  setConfirm("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PinInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="••••"
        className={cn(
          "text-center font-mono text-lg tracking-[0.6em]",
          value.length === 4 && "border-accent/50",
        )}
      />
    </div>
  );
}
