export type UserRole = 'admin' | 'cliente';

export interface UnifiedAuthOutput {
  sessionId: string;
  name: string;
  email: string;
  role: UserRole;
  platformUserId?: string;
  code?: string;
}

export interface LoginUnifiedInput {
  email: string;
  password: string;
}

export interface ResolveSessionInput {
  authUid: string;
  email: string;
  name: string;
}
