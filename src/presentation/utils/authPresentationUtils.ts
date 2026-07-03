import type { UserRole } from '../../application/dto/auth/UnifiedAuthDto.ts';

export const GetHomePathForRole = (role: UserRole): string =>
  role === 'admin' ? '/admin' : '/';

export const GetAccountPathForRole = (role: UserRole): string =>
  role === 'admin' ? '/admin' : '/cuenta';
