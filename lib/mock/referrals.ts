/**
 * Mock referral-program data.
 *
 * Each operator gets a unique referral code, lifetime earnings, and a list
 * of clients they brought in. Earnings are computed as 5% of each client's
 * spend on the platform.
 */

const DAY = 1000 * 60 * 60 * 24;

export interface ReferredClient {
  id: string;
  name: string;
  /** Vertical the client operates in. */
  vertical: string;
  /** When the client joined via this referral (ms epoch). */
  joinedAt: number;
  /** Total spend on the platform since joining (USD). */
  lifetimeSpend: number;
  /** Spend in the trailing 30 days (USD). */
  monthSpend: number;
  /** "active" = currently sending traffic, "churned" = stopped. */
  status: "active" | "churned";
}

export const REFERRAL_COMMISSION_RATE = 0.05; // 5%

export const MOCK_REFERRAL_CODE = "VORTYX-A4F9X";
export const MOCK_REFERRAL_LINK = `https://vortyx.io/r/${MOCK_REFERRAL_CODE}`;

export const MOCK_REFERRED_CLIENTS: ReferredClient[] = [
  {
    id: "rc_001",
    name: "Apex Insurance",
    vertical: "Health Insurance",
    joinedAt: Date.now() - DAY * 184,
    lifetimeSpend: 48_750,
    monthSpend: 7_840,
    status: "active",
  },
  {
    id: "rc_002",
    name: "LawHelp Direct",
    vertical: "Legal",
    joinedAt: Date.now() - DAY * 140,
    lifetimeSpend: 32_120,
    monthSpend: 5_410,
    status: "active",
  },
  {
    id: "rc_003",
    name: "Medi Connect",
    vertical: "Health Insurance",
    joinedAt: Date.now() - DAY * 92,
    lifetimeSpend: 21_480,
    monthSpend: 4_280,
    status: "active",
  },
  {
    id: "rc_004",
    name: "Solar United",
    vertical: "Solar",
    joinedAt: Date.now() - DAY * 60,
    lifetimeSpend: 14_120,
    monthSpend: 3_910,
    status: "active",
  },
  {
    id: "rc_005",
    name: "Lendly Direct",
    vertical: "Finance",
    joinedAt: Date.now() - DAY * 240,
    lifetimeSpend: 12_870,
    monthSpend: 0,
    status: "churned",
  },
  {
    id: "rc_006",
    name: "Home Pro Network",
    vertical: "Home Services",
    joinedAt: Date.now() - DAY * 32,
    lifetimeSpend: 6_240,
    monthSpend: 2_120,
    status: "active",
  },
];
