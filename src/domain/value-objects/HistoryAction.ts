export const HISTORY_ACTION = {
  Create: 'create',
  Update: 'update',
  Delete: 'delete',
  Deactivate: 'deactivate',
  Reactivate: 'reactivate',
  Login: 'login',
  LoginFailed: 'login_failed',
} as const;

export type HistoryAction = (typeof HISTORY_ACTION)[keyof typeof HISTORY_ACTION];
