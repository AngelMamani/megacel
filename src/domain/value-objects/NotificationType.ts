export const NOTIFICATION_TYPE = {
  Info: 'info',
  Warning: 'warning',
  Success: 'success',
  Error: 'error',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
