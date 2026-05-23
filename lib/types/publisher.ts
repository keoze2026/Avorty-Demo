export type PublisherStatus = "active" | "paused" | "pending";

export interface Publisher {
  id: string;
  name: string;
  organization: string;
  status: PublisherStatus;
  callsToday: number;
  revenueToday: number;
  conversionRate: number;
  numbersAssigned: number;
}
