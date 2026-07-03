import type { UserRole } from '../../application/dto/auth/UnifiedAuthDto.ts';
import type { UnifiedAuthOutput } from '../../application/dto/auth/UnifiedAuthDto.ts';

export type { UserRole };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  platformUserId?: string;
  code?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const MapUnifiedAuthToUser = (session: UnifiedAuthOutput): AuthUser => ({
  id: session.sessionId,
  name: session.name,
  email: session.email,
  role: session.role,
  platformUserId: session.platformUserId,
  code: session.code,
});
