export const TREND_DIRECTION = {
  Up: 'up',
  Down: 'down',
  Stable: 'stable',
} as const;

export type TrendDirection = (typeof TREND_DIRECTION)[keyof typeof TREND_DIRECTION];

export function isTrendDirection(value: string): value is TrendDirection {
  return Object.values(TREND_DIRECTION).includes(value as TrendDirection);
}
