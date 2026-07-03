export const ORDER_STATUS = {
  Pending: 'pending',
  VerifyingPayment: 'verifying_payment',
  PaymentSuccessful: 'payment_successful',
  Rejected: 'rejected',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Estados antiguos aún presentes en Firebase. */
export type LegacyOrderStatus = 'processing' | 'completed' | 'cancelled';

export type StoredOrderStatus = OrderStatus | LegacyOrderStatus;

export const ORDER_STATUS_LABELS: Record<StoredOrderStatus, string> = {
  pending: 'Pendiente',
  verifying_payment: 'Verificando pago',
  payment_successful: 'Pago exitoso',
  rejected: 'Pedido rechazado',
  processing: 'Verificando pago',
  completed: 'Pago exitoso',
  cancelled: 'Pedido rechazado',
};

export const ORDER_STATUS_COLORS: Record<StoredOrderStatus, string> = {
  pending: '#f59e0b',
  verifying_payment: '#3b82f6',
  payment_successful: '#10b981',
  rejected: '#ef4444',
  processing: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const LEGACY_TO_CURRENT: Record<LegacyOrderStatus, OrderStatus> = {
  processing: ORDER_STATUS.VerifyingPayment,
  completed: ORDER_STATUS.PaymentSuccessful,
  cancelled: ORDER_STATUS.Rejected,
};

export function isOrderStatus(value: string): value is OrderStatus {
  return Object.values(ORDER_STATUS).includes(value as OrderStatus);
}

export function normalizeToWritableOrderStatus(status: string): OrderStatus {
  if (isOrderStatus(status)) return status;
  return LEGACY_TO_CURRENT[status as LegacyOrderStatus] ?? ORDER_STATUS.Pending;
}

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as StoredOrderStatus] ?? status;
}

export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status as StoredOrderStatus] ?? '#64748b';
}

export function matchesOrderStatusFilter(orderStatus: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (orderStatus === filter) return true;
  return normalizeToWritableOrderStatus(orderStatus) === filter;
}

export function isVerifyingPaymentOrder(status: string): boolean {
  return status === ORDER_STATUS.VerifyingPayment || status === 'processing';
}

export function isPaymentSuccessfulOrder(status: string): boolean {
  return status === ORDER_STATUS.PaymentSuccessful || status === 'completed';
}

export function isRejectedOrder(status: string): boolean {
  return status === ORDER_STATUS.Rejected || status === 'cancelled';
}

export function isInProgressOrder(status: string): boolean {
  return status === ORDER_STATUS.Pending || isVerifyingPaymentOrder(status);
}

/** Pedido con pago confirmado (incluye ventas en tienda y pedidos legacy). */
export function isCompletedOrder(status: string): boolean {
  return isPaymentSuccessfulOrder(status);
}
