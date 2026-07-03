import {
  getOrderStatusLabel,
  getOrderStatusColor,
  isInProgressOrder,
  isPaymentSuccessfulOrder,
  isRejectedOrder,
  isVerifyingPaymentOrder,
  ORDER_STATUS,
  type StoredOrderStatus,
} from '../../../domain/value-objects/OrderStatus.ts';
import { formatMoney } from '../../../domain/value-objects/Money.ts';
import { FormatPeruDateTime } from '../../../domain/value-objects/PeruDateTime.ts';

export const FormatStoreCurrency = (amount: number) => formatMoney(amount);

export const BuildStoreProductPath = (productId: string) =>
  `/producto/${encodeURIComponent(productId)}`;

export const GetOrderStatusLabel = (status: StoredOrderStatus | string) =>
  getOrderStatusLabel(status);

export const GetOrderStatusTone = (status: StoredOrderStatus | string): string => {
  if (status === ORDER_STATUS.Pending) return 'warning';
  if (isVerifyingPaymentOrder(status)) return 'info';
  if (isPaymentSuccessfulOrder(status)) return 'success';
  if (isRejectedOrder(status)) return 'danger';
  return 'neutral';
};

export const GetOrderStatusColor = (status: StoredOrderStatus | string) =>
  getOrderStatusColor(status);

export { isInProgressOrder, isPaymentSuccessfulOrder, isRejectedOrder };

export const FormatStoreDate = (value: string) => FormatPeruDateTime(value);
