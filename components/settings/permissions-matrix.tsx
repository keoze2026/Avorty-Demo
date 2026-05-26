"use client";

/**
 * The Team section's centerpiece — a 2D role × capability matrix with
 * interactive toggles. Looks like a control panel; reads like a contract.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  CAPABILITIES,
  DEFAULT_MATRIX,
  ROLE_DESCRIPTIONS,
  ROLES_IN_ORDER,
} from "@/lib/mock/settings";
import type { MemberRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PermissionsMatrix() {
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);

  const toggle = (role: MemberRole, capKey: string) => {
    if (role === "admin") return; // admin always has everything
    setMatrix((m) => ({
      ...m,
      [role]: { ...m[role], [capKey]: !m[role][capKey] },
    }));
  };

  const onSave = () => {
    toast.success("Permissions saved", {
      description: "Role changes propagate to every session within ~30s.",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Permission matrix</h3>
            <p className="text-[10px] text-muted-foreground">
              {CAPABILITIES.length} capabilities × {ROLES_IN_ORDER.length} roles
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-all hover:brightness-110"
        >
          Save matrix
        </button>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/60">
              <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-mono uppercase tracking-wider text-muted-foreground">
                Capability
              </th>
              {ROLES_IN_ORDER.map((role) => (
                <th key={role} className="px-3 py-3 text-center font-mono uppercase tracking-wider text-muted-foreground">
                  <span title={ROLE_DESCRIPTIONS[role]} className="cursor-help">
                    {role}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((cap, ci) => (
              <tr key={cap.key} className={ci % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                <td className="sticky left-0 z-10 bg-inherit border-r border-border/40 px-4 py-2.5">
                  <div className="font-medium">{cap.label}</div>
                  <div className="text-[10px] text-muted-foreground">{cap.description}</div>
                </td>
                {ROLES_IN_ORDER.map((role) => {
                  const enabled = matrix[role]?.[cap.key] ?? false;
                  const locked = role === "admin"; // admin always-on
                  return (
                    <td key={role} className="px-3 py-2.5 text-center">
                      <Cell enabled={enabled} locked={locked} onClick={() => toggle(role, cap.key)} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({
  enabled,
  locked,
  onClick,
}: {
  enabled: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={cn(
        "group inline-flex h-7 w-7 items-center justify-center rounded-md border transition-all",
        enabled
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/30",
        locked && "cursor-not-allowed opacity-90",
      )}
      aria-label={enabled ? "Allowed" : "Denied"}
    >
      {locked ? (
        <Lock className="h-3 w-3" />
      ) : enabled ? (
        <motion.span
          key="on"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.span>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
      )}
    </button>
  );
}
