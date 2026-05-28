"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TCPA_PROVIDER_TYPES,
  type TcpaProviderType,
} from "@/lib/mock/suppression";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the trimmed name + selected type when the user confirms. */
  onCreate: (input: { name: string; type: TcpaProviderType }) => void;
}

/** "Create provider" dialog launched from the TCPA Shield page. */
export function CreateTcpaShieldDialog({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<TcpaProviderType>(TCPA_PROVIDER_TYPES[0]);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setType(TCPA_PROVIDER_TYPES[0]);
    }
  }, [open]);

  const trimmed = name.trim();
  const onSubmit = () => {
    if (!trimmed) return;
    onCreate({ name: trimmed, type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold uppercase tracking-wider">
            Create provider
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tp-name">Provider name</Label>
            <Input
              id="tp-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
              placeholder="e.g. Provider234"
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Type</Label>
            <div className="inline-flex w-full overflow-hidden rounded-md border border-border bg-secondary/40 p-0.5">
              {TCPA_PROVIDER_TYPES.map((t) => {
                const active = t === type;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="my-2 h-px w-full bg-border" />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!trimmed}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
