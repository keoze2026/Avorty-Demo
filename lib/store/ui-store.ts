/** Persistent + ephemeral UI state: sidebar, command palette, breadcrumb overrides. */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebar: (collapsed: boolean) => void;

  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  /**
   * Per-path breadcrumb label overrides. Pages can register a label
   * (e.g. a campaign name for `/campaigns/c_xyz`) so the breadcrumb is human-readable.
   * Ephemeral — not persisted.
   */
  breadcrumbOverrides: Record<string, string>;
  setBreadcrumbOverride: (path: string, label: string) => void;
  clearBreadcrumbOverride: (path: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),

      commandOpen: false,
      setCommandOpen: (open) => set({ commandOpen: open }),

      breadcrumbOverrides: {},
      setBreadcrumbOverride: (path, label) =>
        set((s) => ({ breadcrumbOverrides: { ...s.breadcrumbOverrides, [path]: label } })),
      clearBreadcrumbOverride: (path) =>
        set((s) => {
          const next = { ...s.breadcrumbOverrides };
          delete next[path];
          return { breadcrumbOverrides: next };
        }),
    }),
    {
      name: "vortyx.ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
