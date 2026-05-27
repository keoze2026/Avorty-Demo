"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CallPerfCardProps {
  revenue: number;
  payout: number;
}

export function CallPerfCard({ revenue, payout }: CallPerfCardProps) {
  const profit = revenue - payout;
  const profitNegative = profit < 0;

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-3">
          <Cell label="Revenue" value={formatCurrency(revenue, true)} />
          <Cell label="Payout" value={formatCurrency(payout, true)} />
          <Cell
            label="Profit"
            value={formatCurrency(profit, true)}
            valueClass={profitNegative ? "text-destructive" : "text-[color:var(--success)]"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Cell({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 truncate text-lg font-semibold tabular-nums", valueClass)}>
        {value}
      </div>
    </div>
  );
}
