import {
  isPaymentSuccessfulOrder,
  type StoredOrderStatus,
} from '../value-objects/OrderStatus.ts';

/** Pago confirmado: descontar stock y sumar unidades vendidas. */
export const ShouldApplySaleInventory = (
  previousStatus: StoredOrderStatus | string | undefined,
  nextStatus: StoredOrderStatus | string
): boolean =>
  isPaymentSuccessfulOrder(nextStatus) && !isPaymentSuccessfulOrder(previousStatus ?? '');

/** Sale del estado de pago exitoso: devolver stock y revertir unidades vendidas. */
export const ShouldReverseSaleInventory = (
  previousStatus: StoredOrderStatus | string | undefined,
  nextStatus: StoredOrderStatus | string
): boolean =>
  isPaymentSuccessfulOrder(previousStatus ?? '') && !isPaymentSuccessfulOrder(nextStatus);

export { ShouldIncrementSoldCount, CountsTowardSoldTotal } from './ProductSoldCountPolicy.ts';
