"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { useDestinationsStore } from "@/lib/store/destinations-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type RoutingOption = "Standard" | "Menu" | "Call Flow" | "Revenue";
type DuplicateHandling = "Normal" | "Original" | "Different";
type DirectionScope = "Destination" | "Buyer";

const ROUTING_OPTIONS: RoutingOption[] = ["Standard", "Menu", "Call Flow", "Revenue"];
const DUPLICATE_OPTIONS: DuplicateHandling[] = ["Normal", "Original", "Different"];
const DIRECTION_OPTIONS: DirectionScope[] = ["Destination", "Buyer"];

interface ForwardCallsSectionProps {
  campaignId: string;
}

export function ForwardCallsSection({ campaignId }: ForwardCallsSectionProps) {
  const [routing, setRouting] = useState<RoutingOption>("Standard");
  const [duplicate, setDuplicate] = useState<DuplicateHandling>("Different");
  const [direction, setDirection] = useState<DirectionScope>("Destination");
  const [strict, setStrict] = useState(true);

  const allDestinations = useDestinationsStore((s) => s.destinations);
  const setEnabled = useDestinationsStore((s) => s.setEnabled);

  // Show every active destination — a real router pick is determined by the
  // campaignâ†”buyerâ†”destination chain; for this UI we list all enabled ones
  // so the user can reorder them by priority/weight.
  const destinations = useMemo(
    () => (allDestinations ?? []).filter((d) => d.enabled),
    [allDestinations],
  );

  const [priorities, setPriorities] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold uppercase tracking-wider">Forward Calls To</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Automatically forward all incoming calls to destinations or groups in this campaign.
        </p>
      </div>

      <Card className="space-y-5 p-5">
        <ChoiceRow
          label="Routing Option"
          description="Select the routing type for your calls"
          value={routing}
          options={ROUTING_OPTIONS}
          onChange={setRouting}
        />
        <ChoiceRow
          label="Duplicate Handling"
          description="Select how to route duplicate calls in the campaign"
          value={duplicate}
          options={DUPLICATE_OPTIONS}
          onChange={setDuplicate}
        />
        <ChoiceRow
          label="Direction Scope"
          description="Defines whether duplicate routing is applied at the Destination or Buyer level of the original call"
          value={direction}
          options={DIRECTION_OPTIONS}
          onChange={setDirection}
        />
        <div className="flex items-start justify-between gap-3 border-t border-border pt-4">
          <div>
            <div className="text-sm font-medium">Use Strict Mode</div>
            <div className="text-xs text-muted-foreground">Connect repeat calls to new destinations only</div>
          </div>
          <Switch checked={strict} onCheckedChange={setStrict} aria-label="Use strict mode" />
        </div>
      </Card>

      {/* Destinations priority table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Routed destinations
          </div>
          <Button
            size="sm"
            onClick={() => toast.info("Attach destination — coming soon")}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 uppercase tracking-wider text-[11px]">Priority</TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">Weight</TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">Name</TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">Number</TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">Type</TableHead>
              <TableHead className="uppercase tracking-wider text-[11px]">Revenue</TableHead>
              <TableHead className="text-center uppercase tracking-wider text-[11px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="pl-6 py-6 text-sm text-muted-foreground">
                  No destinations routed to this campaign yet.
                </TableCell>
              </TableRow>
            ) : (
              destinations.slice(0, 8).map((d, i) => {
                const buyer = MOCK_BUYERS.find((b) => b.id === d.buyerId);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="pl-6">
                      <Input
                        type="number"
                        min={1}
                        className="h-7 w-16"
                        value={priorities[d.id] ?? i + 1}
                        onChange={(e) =>
                          setPriorities((p) => ({ ...p, [d.id]: Number(e.target.value) }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="h-7 w-20"
                        value={weights[d.id] ?? 100}
                        onChange={(e) =>
                          setWeights((p) => ({ ...p, [d.id]: Number(e.target.value) }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`${ROUTES.destinations}/${d.id}`}
                        className="text-sm font-medium transition-colors hover:text-accent"
                      >
                        {d.name}
                      </Link>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {buyer?.name ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {d.tfn}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                        )}
                      >
                        Call Connected
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      {formatCurrency(buyer?.bidAmount ?? 0, true)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={d.enabled}
                        onCheckedChange={(v) => {
                          setEnabled(d.id, v);
                          toast.success(v ? `Enabled ${d.name}` : `Disabled ${d.name}`);
                        }}
                        aria-label={`Toggle ${d.name}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}

function ChoiceRow<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="inline-flex rounded-md border border-border bg-muted p-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === opt
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
