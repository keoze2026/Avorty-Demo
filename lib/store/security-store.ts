"use client";

/**
 * Security store — persists the user's 2FA and PIN configuration.
 *
 *   2FA   - Google Authenticator (TOTP). User scans a QR once, then enters
 *           a 6-digit code on every login.
 *   PIN   - 4-digit code that gates historical reports (anything before
 *           today). Unlock is per-session — closing the tab re-locks.
 *
 * Persistence model:
 *   - `twoFactorEnabled` + `twoFactorSecret` + `reportsPin` → localStorage
 *     (these are the user's saved settings; survive across sessions).
 *   - `twoFactorVerifiedAt` + `reportsPinUnlocked` → sessionStorage
 *     (the per-session locks; cleared when the tab closes).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SecuritySettings {
  /** Whether the user has finished the Google Authenticator setup. */
  twoFactorEnabled: boolean;
  /** Base32-encoded TOTP secret. Captured at setup time. */
  twoFactorSecret: string | null;
  /** 4-digit PIN hash. Stored as plain digits in this mock — in production
   *  this would be a server-side bcrypt with a salt. */
  reportsPin: string | null;
}

interface SecuritySessionState {
  /** Timestamp (ms) when 2FA was last verified this session. Null = not yet
   *  verified, so the login flow should show the challenge. */
  twoFactorVerifiedAt: number | null;
  /** True once the user has entered the correct PIN this session. */
  reportsPinUnlocked: boolean;
}

interface SecurityActions {
  /** Persist a freshly-scanned TOTP secret and flip enabled on. */
  enable2FA: (secret: string) => void;
  /** Wipe the TOTP secret + flip enabled off. */
  disable2FA: () => void;
  /** Mark the current session as having passed the 2FA challenge. */
  setTwoFactorVerified: () => void;

  /** Set / change the 4-digit reports PIN. */
  setReportsPin: (pin: string) => void;
  /** Clear the saved reports PIN. */
  clearReportsPin: () => void;
  /** Mark the PIN as unlocked for the current session. */
  unlockReports: () => void;
  /** Lock the reports back (manual lock or sign-out). */
  lockReports: () => void;
}

type SecurityState = SecuritySettings & SecuritySessionState & SecurityActions;

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      // Persisted settings
      twoFactorEnabled: false,
      twoFactorSecret: null,
      reportsPin: null,

      // Session-only (cleared on each new tab)
      twoFactorVerifiedAt: null,
      reportsPinUnlocked: false,

      enable2FA: (secret) =>
        set({ twoFactorEnabled: true, twoFactorSecret: secret }),
      disable2FA: () =>
        set({
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorVerifiedAt: null,
        }),
      setTwoFactorVerified: () => set({ twoFactorVerifiedAt: Date.now() }),

      setReportsPin: (pin) => set({ reportsPin: pin, reportsPinUnlocked: true }),
      clearReportsPin: () =>
        set({ reportsPin: null, reportsPinUnlocked: false }),
      unlockReports: () => set({ reportsPinUnlocked: true }),
      lockReports: () => set({ reportsPinUnlocked: false }),
    }),
    {
      name: "vortyx.security",
      // Only persist the *settings* — the session locks live in memory and
      // reset whenever the tab is closed.
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        twoFactorEnabled: s.twoFactorEnabled,
        twoFactorSecret: s.twoFactorSecret,
        reportsPin: s.reportsPin,
      }),
    },
  ),
);
