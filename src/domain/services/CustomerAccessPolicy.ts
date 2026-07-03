import type { PlatformUser } from '../entities/PlatformUser.ts';
import { PLATFORM_USER_ROLE } from '../value-objects/PlatformUserRole.ts';
import { PLATFORM_USER_STATUS } from '../value-objects/PlatformUserStatus.ts';

export function IsActiveCustomer(user: PlatformUser | null | undefined): user is PlatformUser {
  if (!user) return false;
  return user.role === PLATFORM_USER_ROLE.Customer && user.status === PLATFORM_USER_STATUS.Active;
}

export function CreateCustomerAccessError(email: string): Error {
  return new Error(
    `La cuenta ${email} no está habilitada como cliente. Regístrate o contacta a soporte de MEGA CEL.`
  );
}
