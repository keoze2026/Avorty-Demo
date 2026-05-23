/**
 * API client abstraction.
 *
 * Today this returns mock data with simulated latency. When a real backend
 * is available, swap the inside of each method for `fetch(...)` calls —
 * the rest of the app never has to change.
 */

import { MOCK_BUYERS } from "@/lib/mock/buyers";
import { MOCK_CALLS } from "@/lib/mock/calls";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns";
import { MOCK_PUBLISHERS } from "@/lib/mock/publishers";
import type { Buyer, Call, Campaign, Publisher } from "@/lib/types";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async listCampaigns(): Promise<Campaign[]> {
    await delay();
    return MOCK_CAMPAIGNS;
  },
  async getCampaign(id: string): Promise<Campaign | undefined> {
    await delay();
    return MOCK_CAMPAIGNS.find((c) => c.id === id);
  },

  async listCalls(limit = 50): Promise<Call[]> {
    await delay();
    return MOCK_CALLS.slice(0, limit);
  },

  async listBuyers(): Promise<Buyer[]> {
    await delay();
    return MOCK_BUYERS;
  },

  async listPublishers(): Promise<Publisher[]> {
    await delay();
    return MOCK_PUBLISHERS;
  },
};

export type Api = typeof api;
