import type { CSSProperties, MouseEvent } from 'react';
import type { Order } from '../../../../domain/entities/Order.ts';
import { FormatOrderDate, GetCustomerInitials, GetOrderLabel } from '../utils/orderPresentationUtils.ts';
import { IconEdit, IconEye, IconTrash } from './OrderIcons.tsx';
import { OrderStatusBadge } from './OrderStatusBadge.tsx';

interface OrderTableViewProps {
  Orders: Order[];
  PendingOrderIds: Set<string>;
  SelectedOrderId: string | null;
  FormatCurrency: (amount: number) => string;
  OnSelect: (order: Order) => void;
  OnView: (order: Order) => void;
  OnEdit: (order: Order) => void;
  OnDelete: (order: Order) => void;
  HasFilters: boolean;
}

export const OrderTableView = ({
  Orders,
  PendingOrderIds,
  SelectedOrderId,
  FormatCurrency,
  OnSelect,
  OnView,
  OnEdit,
  OnDelete,
  HasFilters,
}: OrderTableViewProps) => {
  const HandleRowClick = (order: Order) => {
    if (PendingOrderIds.has(order.id)) return;
    OnSelect(order);
    OnView(order);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="orders-table-shell">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Artículos</th>
            <th>Total</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {Orders.length > 0 ? (
            Orders.map((order, index) => {
              const isPending = PendingOrderIds.has(order.id);
              return (
                <tr
                  key={order.id}
                  className={[
                    isPending ? 'orders-table__row--pending' : '',
                    SelectedOrderId === order.id ? 'orders-table__row--selected' : '',
                    'orders-table__row--interactive',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ '--row-delay': `${Math.min(index * 40, 320)}ms` } as CSSProperties}
                  onClick={() => HandleRowClick(order)}
                  tabIndex={isPending ? -1 : 0}
                  onKeyDown={(e) => {
                    if (isPending) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      HandleRowClick(order);
                    }
                  }}
                  role="button"
                  aria-label={`Ver pedido ${GetOrderLabel(order)}`}
                >
                  <td>
                    <div className="orders-table__order">
                      <span className="orders-table__avatar">{GetCustomerInitials(order.customerName)}</span>
                      <div>
                        <strong>{GetOrderLabel(order)}</strong>
                        <span className="orders-table__ref">{order.id}</span>
                        {isPending && <span className="orders-table__pending">Sincronizando...</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="orders-table__customer">
                      <span>{order.customerName}</span>
                      {order.customerEmail && (
                        <span className="orders-table__email">{order.customerEmail}</span>
                      )}
                    </div>
                  </td>
                  <td>{FormatOrderDate(order.date)}</td>
                  <td>
                    <span className="orders-table__items">{order.items}</span>
                  </td>
                  <td>
                    <strong className="orders-table__total">{FormatCurrency(order.total)}</strong>
                  </td>
                  <td>
                    <OrderStatusBadge Status={order.status} />
                  </td>
                  <td onClick={StopActions}>
                    <div className="orders-table__actions">
                      <button
                        type="button"
                        className="orders-table__action orders-table__action--view"
                        title="Ver"
                        aria-label={`Ver ${GetOrderLabel(order)}`}
                        onClick={() => OnView(order)}
                        disabled={isPending}
                      >
                        <IconEye size={16} />
                      </button>
                      <button
                        type="button"
                        className="orders-table__action orders-table__action--edit"
                        title="Editar"
                        aria-label={`Editar ${GetOrderLabel(order)}`}
                        onClick={() => OnEdit(order)}
                        disabled={isPending}
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        type="button"
                        className="orders-table__action orders-table__action--delete"
                        title="Eliminar"
                        aria-label={`Eliminar ${GetOrderLabel(order)}`}
                        onClick={() => OnDelete(order)}
                        disabled={isPending}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7}>
                <div className="orders-empty">
                  <span className="orders-empty__icon" aria-hidden>
                    📦
                  </span>
                  <h3>Sin resultados</h3>
                  <p>
                    {HasFilters
                      ? 'No hay pedidos que coincidan con los filtros aplicados.'
                      : 'Aún no hay pedidos registrados.'}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
