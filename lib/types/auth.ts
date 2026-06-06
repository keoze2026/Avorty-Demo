export type Role = "admin" | "buyer" | "publisher";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  organization: string;
  phone?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
