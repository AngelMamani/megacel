export const PAYMENT_METHOD = {
  Cash: 'Efectivo',
  Yape: 'Yape',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export function isPaymentMethod(value: string): value is PaymentMethod {
  return Object.values(PAYMENT_METHOD).includes(value as PaymentMethod);
}
