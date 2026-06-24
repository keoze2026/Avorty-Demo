import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Routing editor" };

/**
 * The routing editor breaks out of the (app) layout's `max-w-7xl` constraint
 * so the canvas can fill the available width. We negate the parent padding
 * with mixins (mx-[-1rem] etc.) so the editor sits flush.
 */
export default function RoutingEditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8 lg:-my-8 max-w-none">
      {children}
    </div>
  );
}
