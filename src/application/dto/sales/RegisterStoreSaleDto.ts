import type { Order } from '../../../domain/entities/Order.ts';
import type { SaleSource } from '../../../domain/value-objects/SaleSource.ts';
import type { PaymentMethod } from '../../../domain/value-objects/PaymentMethod.ts';

export interface RegisterStoreSaleInput {
  productId: string;
  quantity: number;
  source: SaleSource;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  existingOrders: Order[];
  actorEmail?: string;
  actorName?: string;
}

export interface RegisterStoreSaleOutput {
  order: Order;
}
