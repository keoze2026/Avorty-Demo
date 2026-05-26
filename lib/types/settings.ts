/** Settings-module types. */

import type { Role } from "./auth";

export type MemberRole = Role | "manager" | "viewer";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  /** Initials + a gradient pair used by the avatar */
  initials: string;
  avatar: [string, string];
  /** "active" once joined; "invited" while pending; "suspended" if revoked */
  status: "active" | "invited" | "suspended";
  invitedAt: number;
  joinedAt?: number;
  lastActiveAt?: number;
}

export type ApiScope = "read" | "write" | "admin";

export interface ApiKey {
  id: string;
  name: string;
  /** What we show in the UI — the rest of the token is hashed */
  prefix: string;
  scopes: ApiScope[];
  createdAt: number;
  lastUsedAt?: number;
  createdByName: string;
}

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  city?: string;
  current: boolean;
  lastActiveAt: number;
}

export interface NotificationPref {
  key: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

/** A capability that can be toggled per role in the permission matrix. */
export interface Capability {
  key: string;
  label: string;
  description: string;
}
