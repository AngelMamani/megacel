import type { Order } from '../../../../domain/entities/Order.ts';

import type { OrderStatus } from '../../../../domain/value-objects/OrderStatus.ts';

export type OrderViewMode = 'grid' | 'table';

export type OrderSortKey = 'recent' | 'total_desc' | 'total_asc' | 'customer';

export type OrderView = Order;

export interface OrderStats {
  Total: number;
  PendingReview: number;
  PaymentSuccessful: number;
  Rejected: number;
  TotalRevenue: number;
}

export interface OrderEditFormData {
  status: OrderStatus;
  rejectionReason: string;
}
