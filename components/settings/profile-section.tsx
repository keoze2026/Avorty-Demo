"use client";

import { useRef, useState } from "react";
import { Camera, KeyRound, Mail, Shield, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/store/auth-store";

/** Largest avatar we'll keep in localStorage as a data URL. */
const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024; // 1.5 MB

export function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  const setAvatar = useAuthStore((s) => s.setAvatar);

  const [name, setName] = useState(user?.name ?? "Avery Quinn");
  const [email, setEmail] = useState(user?.email ?? "avery@vortyx.io");
  const [mfa, setMfa] = useState(true);
  const [phone, setPhone] = useState("+14155550184");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSave = () => {
    toast.success("Profile saved");
  };

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Always reset so picking the same file twice still triggers change.
    if (e.target) e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Avatar must be an image file");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Avatar must be under 1.5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        toast.error("Could not read image");
        return;
      }
      setAvatar(dataUrl);
      toast.success("Avatar updated");
    };
    reader.onerror = () => toast.error("Could not read image");
    reader.readAsDataURL(file);
  };

  const onRemoveAvatar = () => {
    setAvatar(null);
    toast.success("Avatar removed");
  };

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SectionShell
      eyebrow="Profile"
      title="Your account"
      description="Your personal details — visible to your teammates and on activity feeds."
    >
      {/* Avatar block */}
      <Card>
        <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
          <div className="relative">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={`${name}'s avatar`}
                className="h-20 w-20 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-background shadow-lg"
                style={{ background: "linear-gradient(135deg, #818CF8, #5266E0, #3A4BC4)" }}
              >
                {initials}
              </div>
            )}
            <button
              type="button"
              className="absolute -bottom-1.5 -right-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:text-accent"
              aria-label="Change avatar"
              onClick={onPickAvatar}
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onAvatarChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">Avatar</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PNG, JPG, WEBP, or GIF — up to 1.5 MB. Stored locally on this device.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onPickAvatar}>
                <Camera className="h-3.5 w-3.5" />
                {user?.avatarUrl ? "Replace" : "Upload"}
              </Button>
              {user?.avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveAvatar}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="prof-name" label="Full name" icon={User}>
              <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="prof-email" label="Email" icon={Mail}>
              <Input id="prof-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field id="prof-phone" label="Phone (for SMS alerts)" icon={Mail}>
              <Input id="prof-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field id="prof-role" label="Role" icon={Shield}>
              <Input id="prof-role" value="Admin · Workspace owner" readOnly className="bg-secondary/40" />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => toast.info("Reverted unsaved changes")}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row
            icon={KeyRound}
            label="Password"
            description="Last changed 3 months ago"
            action={
              <Button variant="outline" size="sm" onClick={() => toast.success("Reset email sent")}>
                Send reset link
              </Button>
            }
          />
          <Row
            icon={Shield}
            label="Two-factor authentication"
            description="Authenticator app · TOTP"
            action={
              <div className="flex items-center gap-2">
                <Switch checked={mfa} onCheckedChange={(v) => { setMfa(v); toast.success(v ? "2FA enabled" : "2FA disabled"); }} />
              </div>
            }
          />
        </CardContent>
      </Card>
    </SectionShell>
  );
}

/* ---------- shared building blocks ---------- */

export function SectionShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <header>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </span>
        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  description,
  action,
}: {
  icon: typeof User;
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
