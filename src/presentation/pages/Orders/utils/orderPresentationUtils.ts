import type { Order } from '../../../../domain/entities/Order.ts';
import { formatOrderNumber } from '../../../../domain/services/OrderNumberGenerator.ts';
import {
  isPaymentSuccessfulOrder,
  isRejectedOrder,
  isVerifyingPaymentOrder,
  ORDER_STATUS,
} from '../../../../domain/value-objects/OrderStatus.ts';
import type { OrderSortKey, OrderStats } from '../types/OrderPageTypes.ts';

export const FormatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

export const FormatOrderDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const FormatOrderDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const NormalizeFilterDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr.trim();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const GetOrderLabel = (order: Order): string =>
  order.orderNumber ? formatOrderNumber(order.orderNumber) : order.id;

export const GetCustomerInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export const CalculateOrderStats = (orders: Order[]): OrderStats => {
  const pending = orders.filter((order) => order.status === ORDER_STATUS.Pending).length;
  const verifyingPayment = orders.filter((order) => isVerifyingPaymentOrder(order.status)).length;
  const paymentSuccessful = orders.filter((order) => isPaymentSuccessfulOrder(order.status)).length;
  const rejected = orders.filter((order) => isRejectedOrder(order.status)).length;
  const totalRevenue = orders
    .filter((order) => isPaymentSuccessfulOrder(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  return {
    Total: orders.length,
    PendingReview: pending + verifyingPayment,
    PaymentSuccessful: paymentSuccessful,
    Rejected: rejected,
    TotalRevenue: totalRevenue,
  };
};

export const SortOrders = (orders: Order[], sortBy: OrderSortKey): Order[] => {
  const list = [...orders];

  return list.sort((a, b) => {
    if (sortBy === 'customer') return a.customerName.localeCompare(b.customerName, 'es');
    if (sortBy === 'total_desc') return b.total - a.total;
    if (sortBy === 'total_asc') return a.total - b.total;

    const aDate = a.updatedAt || a.createdAt || a.date;
    const bDate = b.updatedAt || b.createdAt || b.date;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
};
