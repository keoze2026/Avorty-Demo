"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth-store";
import { ROUTES } from "@/lib/constants";
import type { Role } from "@/lib/types";

const DEMO_PRESETS: Array<{ label: string; email: string; role: Role }> = [
  { label: "Admin", email: "avery@vortyx.io", role: "admin" },
  { label: "Buyer", email: "morgan@buyersco.com", role: "buyer" },
  { label: "Publisher", email: "riley@traffichub.com", role: "publisher" },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("avery@vortyx.io");
  const [password, setPassword] = useState("vortyx");
  const [role, setRole] = useState<Role>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await login(email, password, role);
      toast.success("Welcome back to Vortyx");
      router.push(params.get("from") || ROUTES.dashboard);
    } catch {
      toast.error("Sign in failed — try again");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
            Sign in <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
