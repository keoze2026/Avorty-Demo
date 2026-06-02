"use client";

import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface LiveControlsProps {
  paused: boolean;
  onTogglePause: () => void;
  className?: string;
}

export function LiveControls({ paused, onTogglePause, className }: LiveControlsProps) {
  const { t } = useTranslation();
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
            <Play className="h-3.5 w-3.5" /> {t("liveUI.controls.resume")}
          </>
        ) : (
          <>
            <Pause className="h-3.5 w-3.5" /> {t("liveUI.controls.pause")}
          </>
        )}
      </Button>
    </div>
  );
}
