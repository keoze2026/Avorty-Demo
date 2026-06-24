"use client";

/**
 * Security store — persists the user's PIN configuration.
 *
 *   PIN — 4-digit code that gates historical reports (anything before today).
 *         Unlock is per-session — closing the tab re-locks. This is purely a
 *         client-side screen-lock UX, not a server-enforced access control.
 *
 * Real two-factor authentication (TOTP) lives in `useAuthStore` now and is
 * backed by `/api/accounts/mfa/*`. The legacy 2FA fields that used to live
 * here were entirely client-side and got the user no real protection;
 * they've been removed so the only "MFA" surface is the real one.
 *
 * Persistence model:
 *   - `reportsPin` → localStorage (the user's saved setting; survives reloads).
 *   - `reportsPinUnlocked` → sessionStorage (the per-session lock; cleared
 *     when the tab closes).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SecuritySettings {
  /** 4-digit PIN. Stored as plain digits in this mock — see the section
   *  banner in Settings → Security for the honest framing. */
  reportsPin: string | null;
}

interface SecuritySessionState {
  /** True once the user has entered the correct PIN this session. */
  reportsPinUnlocked: boolean;
}

interface SecurityActions {
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
      reportsPin: null,
      reportsPinUnlocked: false,

      setReportsPin: (pin) => set({ reportsPin: pin, reportsPinUnlocked: true }),
      clearReportsPin: () => set({ reportsPin: null, reportsPinUnlocked: false }),
      unlockReports: () => set({ reportsPinUnlocked: true }),
      lockReports: () => set({ reportsPinUnlocked: false }),
    }),
    {
      name: "vortyx.security",
      // Only persist the *settings* — the session lock lives in memory and
      // resets whenever the tab is closed.
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        reportsPin: s.reportsPin,
      }),
    },
  ),
);
