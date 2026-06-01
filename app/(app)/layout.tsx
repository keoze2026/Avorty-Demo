import type { ReactNode } from "react";

import { AuthGuard } from "@/components/app-shell/auth-guard";
import { NotificationRuntime } from "@/components/app-shell/notification-runtime";
import { AppSidebar } from "@/components/app-shell/sidebar-nav";
import { Topbar } from "@/components/app-shell/topbar";
import { SandboxBanner } from "@/components/kyc/sandbox-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Authenticated app shell — sidebar + topbar + main outlet.
 * Every authenticated page under (app)/ inherits this chrome.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="app-canvas !bg-transparent">
          <Topbar />
          <SandboxBanner />
          <NotificationRuntime />
          <div className="flex-1 overflow-auto">
            {/* @container/main lets children respond to the actual content-area
                width (which depends on whether the sidebar is open) instead of
                the viewport width. Use `@<bp>/main:` utilities on children. */}
            <div className="@container/main mx-auto w-full space-y-8 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
