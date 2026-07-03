export const PLATFORM_USER_STATUS = {
  Active: 'activo',
  Inactive: 'inactivo',
} as const;

export type PlatformUserStatus = (typeof PLATFORM_USER_STATUS)[keyof typeof PLATFORM_USER_STATUS];

export function isPlatformUserStatus(value: string): value is PlatformUserStatus {
  return Object.values(PLATFORM_USER_STATUS).includes(value as PlatformUserStatus);
}
