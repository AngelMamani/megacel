export const SALE_SOURCE = {
  Online: 'online',
  Store: 'store',
} as const;

export type SaleSource = (typeof SALE_SOURCE)[keyof typeof SALE_SOURCE];

export function isSaleSource(value: string): value is SaleSource {
  return Object.values(SALE_SOURCE).includes(value as SaleSource);
}
