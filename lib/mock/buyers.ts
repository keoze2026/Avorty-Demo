import type { Buyer } from "@/lib/types";

export const MOCK_BUYERS: Buyer[] = [
  { id: "b_001", name: "Apex Insurance", organization: "Apex Group", status: "active", bidAmount: 45, concurrencyCap: 25, dailyCap: 400, monthlyCap: 10_000, callsToday: 187, spendToday: 8_415 },
  { id: "b_002", name: "Solar United", organization: "SU Inc.", status: "active", bidAmount: 28, concurrencyCap: 15, dailyCap: 300, monthlyCap: 7_500, callsToday: 92, spendToday: 2_576 },
  { id: "b_003", name: "LawHelp Direct", organization: "LawHelp", status: "active", bidAmount: 120, concurrencyCap: 10, dailyCap: 80, monthlyCap: 2_000, callsToday: 24, spendToday: 2_880 },
  { id: "b_004", name: "AutoSafe Warranty", organization: "AutoSafe", status: "paused", bidAmount: 35, concurrencyCap: 20, dailyCap: 250, monthlyCap: 6_000, callsToday: 0, spendToday: 0 },
  { id: "b_005", name: "Medi Connect", organization: "Medi Co.", status: "capped", bidAmount: 55, concurrencyCap: 30, dailyCap: 500, monthlyCap: 12_000, callsToday: 500, spendToday: 27_500 },
  { id: "b_006", name: "Home Pro Network", organization: "HPN", status: "active", bidAmount: 22, concurrencyCap: 12, dailyCap: 200, monthlyCap: 5_000, callsToday: 64, spendToday: 1_408 },
];
