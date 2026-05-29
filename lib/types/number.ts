export type NumberStatus = "active" | "paused" | "pending" | "expired";
export type NumberType = "local" | "tollfree" | "international";

export interface TrackingNumber {
  id: string;
  /** E.164 dial-string — e.g. "+15125550123". */
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

export type PhoneNumberFormat = "E164" | "national" | "international";

export interface TrafficSourceEntry {
  id: string;
  name: string;
  integration: string;
  events: number;
  conversions: number;
}

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

  /* ── Editable settings (set on the create dialog + detail page) ── */
  country?: string;
  /** Pool reservation timeout after a closed browser, in seconds. */
  closedBrowserDelaySec?: number;
  /** Max idle time a number is held for a user, in seconds. */
  idleTimeSec?: number;
  autoBuy?: boolean;

  /* ── Detail-page-only fields ── */
  /** "Replacement Number" — number to replace with one from the pool. */
  replacementNumber?: string;
  phoneNumberFormat?: PhoneNumberFormat;
  /** Ids of TrackingNumbers attached to this pool. */
  attachedNumberIds?: string[];
  vendorEnabled?: boolean;
  vendorId?: string;
  trafficSourcesEnabled?: boolean;
  trafficSources?: TrafficSourceEntry[];
}
