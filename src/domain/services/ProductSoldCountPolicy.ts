import { isPaymentSuccessfulOrder, type StoredOrderStatus } from '../value-objects/OrderStatus.ts';

/** Estados de pedido que cuentan como venta efectiva para el contador del producto. */
export const CountsTowardSoldTotal = (status: StoredOrderStatus | string | undefined): boolean =>
  isPaymentSuccessfulOrder(status ?? '');

/** Incrementa contador solo al pasar a un estado que cuenta como vendido. */
export const ShouldIncrementSoldCount = (
  previousStatus: StoredOrderStatus | string | undefined,
  nextStatus: StoredOrderStatus | string
): boolean => CountsTowardSoldTotal(nextStatus) && !CountsTowardSoldTotal(previousStatus);
