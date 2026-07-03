export const CURRENCY = 'PEN' as const;
export const LOCALE = 'es-PE' as const;

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
  }).format(amount);
}

export function calculateDiscountAmount(price: number, discountPercentage: number): number {
  if (discountPercentage <= 0) return 0;
  if (discountPercentage >= 100) return price;
  return Math.round((price * discountPercentage) / 100 * 100) / 100;
}

export function calculateFinalPrice(
  price: number,
  discount?: number,
  discountPercentage?: number
): number {
  if (discount !== undefined && discount > 0) {
    return Math.max(0, Math.round((price - discount) * 100) / 100);
  }

  if (discountPercentage !== undefined && discountPercentage > 0) {
    const discountAmount = calculateDiscountAmount(price, discountPercentage);
    return Math.max(0, Math.round((price - discountAmount) * 100) / 100);
  }

  return price;
}
