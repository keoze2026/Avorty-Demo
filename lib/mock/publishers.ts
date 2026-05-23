import type { Publisher } from "@/lib/types";

export const MOCK_PUBLISHERS: Publisher[] = [
  { id: "p_001", name: "TrafficHub", organization: "TrafficHub LLC", status: "active", callsToday: 412, revenueToday: 18_540, conversionRate: 0.62, numbersAssigned: 84 },
  { id: "p_002", name: "ClickWave Media", organization: "ClickWave", status: "active", callsToday: 218, revenueToday: 9_810, conversionRate: 0.51, numbersAssigned: 56 },
  { id: "p_003", name: "Northstar Leads", organization: "Northstar", status: "active", callsToday: 96, revenueToday: 4_320, conversionRate: 0.48, numbersAssigned: 32 },
  { id: "p_004", name: "PayPerHero", organization: "PPH Inc.", status: "pending", callsToday: 0, revenueToday: 0, conversionRate: 0, numbersAssigned: 0 },
];
