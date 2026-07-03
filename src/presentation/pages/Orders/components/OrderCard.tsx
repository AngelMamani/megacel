import type { CSSProperties, MouseEvent } from 'react';
import type { Order } from '../../../../domain/entities/Order.ts';
import { FormatOrderDate, GetCustomerInitials, GetOrderLabel } from '../utils/orderPresentationUtils.ts';
import { IconEdit, IconEye, IconTrash } from './OrderIcons.tsx';
import { OrderStatusBadge } from './OrderStatusBadge.tsx';

interface OrderCardProps {
  Order: Order;
  Index: number;
  IsPending: boolean;
  IsSelected: boolean;
  FormatCurrency: (amount: number) => string;
  OnSelect: (order: Order) => void;
  OnView: (order: Order) => void;
  OnEdit: (order: Order) => void;
  OnDelete: (order: Order) => void;
}

export const OrderCard = ({
  Order,
  Index,
  IsPending,
  IsSelected,
  FormatCurrency,
  OnSelect,
  OnView,
  OnEdit,
  OnDelete,
}: OrderCardProps) => {
  const HandleBodyClick = () => {
    if (IsPending) return;
    OnSelect(Order);
    OnView(Order);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <article
      className={`order-card${IsPending ? ' order-card--pending' : ''}${IsSelected ? ' order-card--selected' : ''}`}
      style={{ '--card-delay': `${Math.min(Index * 60, 480)}ms` } as CSSProperties}
      onClick={HandleBodyClick}
      role="button"
      tabIndex={IsPending ? -1 : 0}
      onKeyDown={(e) => {
        if (IsPending) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          HandleBodyClick();
        }
      }}
      aria-label={`Ver pedido ${GetOrderLabel(Order)}`}
    >
      <div className="order-card__header">
        <div className="order-card__id-block">
          <span className="order-card__id">{GetOrderLabel(Order)}</span>
          <span className="order-card__date">{FormatOrderDate(Order.date)}</span>
        </div>
        <OrderStatusBadge Status={Order.status} />
      </div>

      <div className="order-card__body">
        <div className="order-card__customer">
          <span className="order-card__avatar">{GetCustomerInitials(Order.customerName)}</span>
          <div>
            <h3 className="order-card__name">{Order.customerName}</h3>
            {Order.customerEmail && (
              <p className="order-card__email">{Order.customerEmail}</p>
            )}
          </div>
        </div>

        <div className="order-card__metrics">
          <div className="order-card__metric">
            <span className="order-card__metric-label">Artículos</span>
            <strong>{Order.items}</strong>
          </div>
          <div className="order-card__metric order-card__metric--total">
            <span className="order-card__metric-label">Total</span>
            <strong>{FormatCurrency(Order.total)}</strong>
          </div>
        </div>

        {IsPending && (
          <span className="order-card__pending">
            <span className="order-card__spinner" aria-hidden />
            Sincronizando
          </span>
        )}
      </div>

      <div className="order-card__actions" onClick={StopActions}>
        <button
          type="button"
          className="order-card__action order-card__action--view"
          title="Ver detalle"
          aria-label={`Ver ${GetOrderLabel(Order)}`}
          onClick={() => OnView(Order)}
          disabled={IsPending}
        >
          <IconEye />
        </button>
        <button
          type="button"
          className="order-card__action order-card__action--edit"
          title="Editar estado"
          aria-label={`Editar ${GetOrderLabel(Order)}`}
          onClick={() => OnEdit(Order)}
          disabled={IsPending}
        >
          <IconEdit size={16} />
        </button>
        <button
          type="button"
          className="order-card__action order-card__action--delete"
          title="Eliminar"
          aria-label={`Eliminar ${GetOrderLabel(Order)}`}
          onClick={() => OnDelete(Order)}
          disabled={IsPending}
        >
          <IconTrash size={16} />
        </button>
      </div>
    </article>
  );
};
