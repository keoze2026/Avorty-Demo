export type BuyerStatus = "active" | "paused" | "capped";

export interface Buyer {
  id: string;
  name: string;
  organization: string;
  status: BuyerStatus;
  bidAmount: number;
  concurrencyCap: number;
  dailyCap: number;
  monthlyCap: number;
  callsToday: number;
  spendToday: number;
}
