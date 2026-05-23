"use client";

import { Building2, Check, ChevronsUpDown, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Role } from "@/lib/types";

const ROLE_META: Record<Role, { label: string; icon: typeof Building2; description: string }> = {
  admin: { label: "Admin", icon: Building2, description: "Full platform access" },
  buyer: { label: "Buyer", icon: Users, description: "Purchase calls, manage bids" },
  publisher: { label: "Publisher", icon: Users, description: "Send traffic, see payouts" },
};

export function RoleSwitcher() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);

  if (!user) return null;
  const Current = ROLE_META[user.role].icon;

  const onPick = (role: Role) => {
    setRole(role);
    // Refresh server components so RBAC-filtered routes re-render
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono">
          <Current className="h-3.5 w-3.5 text-accent" />
          <span className="hidden sm:inline">{ROLE_META[user.role].label}</span>
          <ChevronsUpDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>View as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(ROLE_META) as Role[]).map((r) => {
          const Icon = ROLE_META[r].icon;
          const active = r === user.role;
          return (
            <DropdownMenuItem
              key={r}
              onSelect={() => onPick(r)}
              className="flex items-start gap-2"
            >
              <Icon className="mt-0.5 h-4 w-4 text-accent" />
              <div className="flex-1">
                <div className="font-mono text-sm">{ROLE_META[r].label}</div>
                <div className="text-[10px] text-muted-foreground">{ROLE_META[r].description}</div>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-accent" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
