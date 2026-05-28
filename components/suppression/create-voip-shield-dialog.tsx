"use client";

import * as React from "react";
import { ShieldPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the trimmed shield name when the user confirms. */
  onCreate: (name: string) => void;
}

/** Single-input "Shield name" dialog launched from the VoIP Shield page's Create button. */
export function CreateVoipShieldDialog({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (!open) setName("");
  }, [open]);

  const trimmed = name.trim();
  const onSubmit = () => {
    if (!trimmed) return;
    onCreate(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <ShieldPlus className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle>New VoIP Shield</DialogTitle>
              <DialogDescription>
                You can attach protected campaigns and blocked carriers after creating it.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="vs-name">Shield name</Label>
          <Input
            id="vs-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder="e.g. Bot net signatures"
          />
        </div>

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
