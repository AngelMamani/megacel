export const PLATFORM_USER_ROLE = {
  Administrator: 'Administrador',
  Customer: 'Cliente',
} as const;

export type PlatformUserRole = (typeof PLATFORM_USER_ROLE)[keyof typeof PLATFORM_USER_ROLE];

export function isPlatformUserRole(value: string): value is PlatformUserRole {
  return Object.values(PLATFORM_USER_ROLE).includes(value as PlatformUserRole);
}
