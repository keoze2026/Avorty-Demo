/** Integrations-module types. */

export type IntegrationCategory =
  | "crm"
  | "telephony"
  | "analytics"
  | "communication"
  | "data"
  | "automation";

export interface IntegrationApp {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  /** Brand color used as the logo background */
  color: string;
  /** 1-2 letter mark for the logo tile */
  mark: string;
  connected: boolean;
  connectedAt?: number;
}

export type WebhookStatus = "active" | "paused" | "failing";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  createdAt: number;
  lastDeliveryAt?: number;
  /** Trailing 24h success ratio (0..1) */
  successRate24h: number;
}

export type DeliveryStatus = "delivered" | "retrying" | "failed";

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: DeliveryStatus;
  responseCode?: number;
  responseTimeMs: number;
  at: number;
}
