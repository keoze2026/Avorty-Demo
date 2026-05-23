export type NumberStatus = "active" | "paused" | "pending" | "expired";
export type NumberType = "local" | "tollfree" | "international";

export interface TrackingNumber {
  id: string;
  /** Pretty-printed E.164 — e.g. "+1 (512) 555-0123" */
  number: string;
  type: NumberType;
  status: NumberStatus;

  campaignId?: string;
  campaignName?: string;
  poolId?: string;
  poolName?: string;

  state?: string;
  city?: string;

  monthlyCost: number;
  callsToday: number;
  callsMonthly: number;
  conversionRate: number; // 0..1

  provisionedAt: number;
  lastCallAt?: number;
}

export type RotationStrategy = "round-robin" | "weighted" | "priority";

export interface NumberPool {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  rotationStrategy: RotationStrategy;
  numberCount: number;
  callsToday: number;
  /** Whether new incoming traffic gets assigned a number from this pool. */
  active: boolean;
}
