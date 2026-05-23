"use client";

import { Bell, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_NOTIFICATIONS = [
  {
    icon: TrendingUp,
    title: "Health Tier 1 spiked 24%",
    body: "Conversion is trending up over the last hour.",
    time: "2m",
    tone: "text-[oklch(0.78_0.18_155)]",
  },
  {
    icon: AlertTriangle,
    title: "Buyer Apex hit daily cap",
    body: "Routing temporarily paused for this buyer.",
    time: "11m",
    tone: "text-[oklch(0.82_0.16_80)]",
  },
  {
    icon: Sparkles,
    title: "AI suggests retiring 3 numbers",
    body: "Low conversion across the last 7 days.",
    time: "1h",
    tone: "text-accent",
  },
];

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-accent">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-3 pt-3">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-auto py-1">
          {MOCK_NOTIFICATIONS.map((n, i) => {
            const Icon = n.icon;
            return (
              <div
                key={i}
                className="flex gap-3 px-3 py-3 text-sm hover:bg-secondary/60 transition-colors cursor-pointer"
              >
                <div className={`mt-0.5 ${n.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{n.title}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{n.time}</span>
              </div>
            );
          })}
        </div>
        <DropdownMenuSeparator />
        <button className="block w-full px-3 py-2 text-center text-xs text-muted-foreground hover:text-foreground">
          View all
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
