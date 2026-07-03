export const HISTORY_ACTOR_TYPE = {
  Admin: 'admin',
  Client: 'client',
} as const;

export type HistoryActorType = (typeof HISTORY_ACTOR_TYPE)[keyof typeof HISTORY_ACTOR_TYPE];
