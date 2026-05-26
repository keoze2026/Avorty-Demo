"use client";

import { NodeFrame } from "./node-frame";
import { NODE_META } from "../node-meta";
import type { RFNodeProps } from "./types";
import { useBuyer } from "@/components/routing/use-buyer";
import { formatCurrency } from "@/lib/format";

export function BuyerNode({ data, selected }: RFNodeProps<"buyer">) {
  const meta = NODE_META.buyer;
  const cfg = data.buyer;
  if (!cfg) return null;

  const buyer = useBuyer(cfg.buyerId);
  const bid = cfg.bidOverride ?? buyer?.bidAmount ?? 0;

  return (
    <NodeFrame icon={meta.icon} title={meta.label} tone={meta.tone} selected={selected} outputs={[]}>
      <div className="space-y-1">
        <div className="truncate text-sm font-semibold">{cfg.buyerName || "Pick a buyer"}</div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-mono">{buyer?.organization ?? "—"}</span>
          <span className="font-mono">{formatCurrency(bid, true)}</span>
        </div>
      </div>
    </NodeFrame>
  );
}
