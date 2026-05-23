/**
 * Auth store — mock implementation backed by localStorage.
 * Swap the inner `login` / `signup` calls for real API requests later;
 * the public store shape stays the same.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Role, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string, role?: Role) => Promise<User>;
  signup: (input: { name: string; email: string; password: string; organization: string }) => Promise<User>;
  logout: () => void;
  setRole: (role: Role) => void;
  _setHydrated: () => void;
}

const mockUserFromEmail = (email: string, name: string, role: Role, organization: string): User => ({
  id: `u_${email.replace(/[^a-z0-9]/gi, "").toLowerCase()}`,
  email,
  name,
  role,
  organization,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,

      login: async (email, _password, role = "admin") => {
        // Simulated latency
        await new Promise((r) => setTimeout(r, 350));
        const name = email.split("@")[0].replace(/\W+/g, " ").trim() || "User";
        const user = mockUserFromEmail(email, capitalize(name), role, "Vortyx Demo Co.");
        set({ user, isAuthenticated: true });
        return user;
      },

      signup: async ({ name, email, organization }) => {
        await new Promise((r) => setTimeout(r, 450));
        const user = mockUserFromEmail(email, name, "admin", organization);
        set({ user, isAuthenticated: true });
        return user;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      setRole: (role) =>
        set((s) => (s.user ? { user: { ...s.user, role } } : s)),

      _setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "vortyx.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => state?._setHydrated(),
    },
  ),
);

function capitalize(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
