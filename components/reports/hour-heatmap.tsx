"use client";

import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HourHeatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat());

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-accent" />
          Hour × day heatmap
        </CardTitle>
        <p className="text-xs text-muted-foreground">Call volume by weekday &amp; hour</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour axis */}
            <div className="ml-8 grid grid-cols-24 gap-px">
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="h-4 text-center text-[9px] font-mono text-muted-foreground"
                  style={{ minWidth: "1.25rem" }}
                >
                  {h % 3 === 0 ? h.toString().padStart(2, "0") : ""}
                </div>
              ))}
            </div>
            {/* Rows */}
            {grid.map((row, dayIdx) => (
              <div key={dayIdx} className="flex items-center gap-px">
                <div className="w-8 pr-1 text-right text-[10px] font-mono text-muted-foreground">
                  {DAYS[dayIdx]}
                </div>
                <div className="grid flex-1 grid-cols-24 gap-px">
                  {row.map((v, h) => {
                    const intensity = v / max;
                    return (
                      <div
                        key={h}
                        title={`${DAYS[dayIdx]} ${h.toString().padStart(2, "0")}:00 — ${v} calls`}
                        className={cn(
                          "h-5 rounded-sm transition-colors",
                          v === 0 && "bg-secondary/40",
                        )}
                        style={{
                          background:
                            v === 0
                              ? undefined
                              : `color-mix(in oklab, var(--accent) ${10 + intensity * 80}%, transparent)`,
                          minWidth: "1.25rem",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-mono text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-px">
            {[10, 30, 50, 70, 90].map((p) => (
              <div
                key={p}
                className="h-3 w-4 rounded-sm"
                style={{ background: `color-mix(in oklab, var(--accent) ${p}%, transparent)` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
