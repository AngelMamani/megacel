import type { CSSProperties } from 'react';
import { getOrderStatusColor, getOrderStatusLabel } from '../../../../domain/value-objects/OrderStatus.ts';

interface OrderStatusBadgeProps {
  Status: string;
}

export const OrderStatusBadge = ({ Status }: OrderStatusBadgeProps) => (
  <span
    className="orders-status-badge"
    style={{ '--status-color': getOrderStatusColor(Status) } as CSSProperties}
  >
    <span className="orders-status-badge__dot" aria-hidden />
    {getOrderStatusLabel(Status)}
  </span>
);
