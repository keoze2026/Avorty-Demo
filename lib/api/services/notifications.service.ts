/**
 * Notifications service — /api/notifications/*.
 * Drives the notification rules + delivery log under Settings → Notifications.
 */

import { http } from "@/lib/api/http";
import type { Paginated } from "@/lib/api/types";

export interface NotificationRule {
  id: string;
  name: string;
  event: string;
  channel: string;
  recipients: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationLog {
  id: string;
  event: string;
  channel: string;
  recipient: string;
  subject: string;
  status: string;
  error: string;
  createdAt: number;
}

interface RuleWire {
  id: string;
  name: string;
  event: string;
  channel: string;
  recipients: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LogWire {
  id: string;
  event: string;
  channel: string;
  recipient: string;
  subject: string;
  status: string;
  error: string;
  createdAt: string;
}

function toTs(s: string | undefined): number {
  if (!s) return Date.now();
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Date.now();
}

function wireToRule(w: RuleWire): NotificationRule {
  return {
    id: w.id,
    name: w.name,
    event: w.event,
    channel: w.channel,
    recipients: Array.isArray(w.recipients) ? w.recipients.map(String) : [],
    isActive: !!w.isActive,
    createdAt: toTs(w.createdAt),
    updatedAt: toTs(w.updatedAt),
  };
}

function wireToLog(w: LogWire): NotificationLog {
  return {
    id: w.id,
    event: w.event,
    channel: w.channel,
    recipient: w.recipient,
    subject: w.subject,
    status: w.status,
    error: w.error,
    createdAt: toTs(w.createdAt),
  };
}

export const notificationsService = {
  async listRules(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<NotificationRule>> {
    const res = await http.get<Paginated<RuleWire>>("/api/notifications/rules/", { query });
    return { ...res, items: res.items.map(wireToRule) };
  },

  async getRule(id: string): Promise<NotificationRule> {
    return wireToRule(await http.get<RuleWire>(`/api/notifications/rules/${id}/`));
  },

  async createRule(input: {
    name: string;
    event: string;
    channel: string;
    recipients: string[];
    isActive?: boolean;
  }): Promise<NotificationRule> {
    return wireToRule(await http.post<RuleWire>("/api/notifications/rules/", { body: input }));
  },

  async updateRule(id: string, patch: Partial<NotificationRule>): Promise<NotificationRule> {
    return wireToRule(
      await http.patch<RuleWire>(`/api/notifications/rules/${id}/`, { body: patch }),
    );
  },

  async deleteRule(id: string): Promise<void> {
    await http.delete(`/api/notifications/rules/${id}/`);
  },

  async test(input: { event: string; channel: string; recipient: string }): Promise<unknown> {
    return http.post("/api/notifications/test/", { body: input });
  },

  async listLogs(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<NotificationLog>> {
    const res = await http.get<Paginated<LogWire>>("/api/notifications/logs/", { query });
    return { ...res, items: res.items.map(wireToLog) };
  },
};
