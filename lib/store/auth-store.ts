/**
 * Auth store — backed by the real /api/accounts/* endpoints.
 *
 * Persists only the `user` snapshot for fast first-paint after a reload;
 * JWT tokens are persisted separately by `lib/api/tokens.ts`. On mount the
 * app shell calls `bootstrap()` to validate the token and refresh the
 * cached user profile.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { ApiError } from "@/lib/api/http";
import { authService } from "@/lib/api/services/auth.service";
import { clearTokens, hasTokens } from "@/lib/api/tokens";
import type { Role, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  /** True while a login / register / bootstrap call is in flight. */
  pending: boolean;
  /** Last error message from an auth call, surfaced for form-level display. */
  error: string | null;

  login: (email: string, password: string, role?: Role) => Promise<User>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    organization: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  /**
   * Called once on app shell mount. If tokens exist, fetches /me to
   * validate them and refresh the user snapshot. No-op if no tokens.
   */
  bootstrap: () => Promise<void>;
  setRole: (role: Role) => void;
  /** Replace the user's avatar locally (and patch it to /me when available). */
  setAvatar: (avatarUrl: string | null) => void;
  _setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,
      pending: false,
      error: null,

      login: async (email, password, role) => {
        set({ pending: true, error: null });
        try {
          const partial = await authService.login({ email, password });
          // Fetch full profile (first/last name, phone, etc.) immediately.
          let user: User;
          try {
            user = await authService.me();
          } catch {
            user = partial; // /me failed but tokens are valid — show the partial.
          }
          // Optional role override — keeps the existing demo role-switch behaviour.
          if (role) user = { ...user, role };
          set({ user, isAuthenticated: true, pending: false, error: null });
          return user;
        } catch (e) {
          // Backend rate-limits login to 5/min — surface a friendlier message
          // than the raw "HTTP 429" so the form can guide the user.
          const friendly =
            e instanceof ApiError && e.status === 429
              ? "Too many sign-in attempts. Please wait a minute and try again."
              : messageFromError(e);
          set({ pending: false, error: friendly });
          throw e;
        }
      },

      signup: async ({ name, email, password, organization, phone }) => {
        set({ pending: true, error: null });
        try {
          const user = await authService.register({
            name,
            email,
            password,
            organizationName: organization,
            phone,
          });
          set({ user, isAuthenticated: true, pending: false, error: null });
          return user;
        } catch (e) {
          set({ pending: false, error: messageFromError(e) });
          throw e;
        }
      },

      logout: async () => {
        // Optimistically clear local state so the UI flips immediately.
        set({ user: null, isAuthenticated: false, error: null });
        try {
          await authService.logout();
        } catch {
          clearTokens();
        }
      },

      bootstrap: async () => {
        // No tokens — drop any stale persisted snapshot and bail.
        if (!hasTokens()) {
          set({ user: null, isAuthenticated: false, hydrated: true });
          return;
        }
        try {
          const user = await authService.me();
          set({ user, isAuthenticated: true, hydrated: true, error: null });
        } catch {
          // Token rejected or network down — clear and treat as logged out.
          clearTokens();
          set({ user: null, isAuthenticated: false, hydrated: true });
        }
      },

      setRole: (role) => set((s) => (s.user ? { user: { ...s.user, role } } : s)),

      setAvatar: (avatarUrl) => {
        set((s) =>
          s.user ? { user: { ...s.user, avatarUrl: avatarUrl ?? undefined } } : s,
        );
        // Best-effort sync to the backend; ignore failures (purely cosmetic).
        const current = get().user;
        if (current && avatarUrl) {
          void authService.updateProfile({ avatarUrl }).catch(() => undefined);
        }
      },

      _setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "vortyx.auth",
      storage: createJSONStorage(() => localStorage),
      // Persist user snapshot for fast first-paint. Tokens live in their own
      // module so we don't double-store credentials.
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);

function messageFromError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Authentication failed";
}
