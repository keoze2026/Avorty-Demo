"use client";

import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveControlsProps {
  paused: boolean;
  onTogglePause: () => void;
  className?: string;
}

export function LiveControls({ paused, onTogglePause, className }: LiveControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={paused ? "default" : "outline"}
        size="sm"
        onClick={onTogglePause}
        className="gap-1.5"
      >
        {paused ? (
          <>
            <Play className="h-3.5 w-3.5" /> Resume
          </>
        ) : (
          <>
            <Pause className="h-3.5 w-3.5" /> Pause
          </>
        )}
      </Button>
    </div>
  );
}
