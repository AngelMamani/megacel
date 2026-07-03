import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { OrderItem } from './OrderItem.ts';
import type { StoredOrderStatus } from '../value-objects/OrderStatus.ts';
import type { SaleSource } from '../value-objects/SaleSource.ts';

/**
 * Pedido o venta del negocio.
 * - online: compra desde la tienda web (clientes)
 * - store: venta registrada manualmente en tienda física (admin)
 */
export interface Order {
  id: EntityId;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  platformUserId?: EntityId;
  total: number;
  status: StoredOrderStatus;
  date: Timestamp;
  items: number;
  orderItems?: OrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  source?: SaleSource;
  orderNumber?: number;
}
