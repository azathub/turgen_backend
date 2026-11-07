import type { Request } from 'express';

export type UserRole = 'user' | 'admin';

export interface AuthenticatedUser {
  sub: number;
  email: string;
  role: UserRole;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
