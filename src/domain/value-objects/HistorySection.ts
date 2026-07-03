export const HISTORY_SECTION = {
  Products: 'products',
  Categories: 'categories',
  Brands: 'brands',
  Orders: 'orders',
  Users: 'users',
  Auth: 'auth',
} as const;

export type HistorySection = (typeof HISTORY_SECTION)[keyof typeof HISTORY_SECTION];
