export type Role = "admin" | "buyer" | "publisher";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  organization: string;
  phone?: string;
  /** Backend `is_superuser` flag. Superusers (and any user with role === "admin")
   *  bypass the onboarding gates (KYC + balance) — they always have full access. */
  isSuperuser?: boolean;
  /** Whether the user has TOTP-based MFA enrolled on the backend. Drives
   *  the Settings → Security 2FA card and the login challenge gating. */
  mfaEnabled?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
