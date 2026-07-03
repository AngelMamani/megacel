import type { FormEvent } from 'react';
import type { Order } from '../../../../domain/entities/Order.ts';
import type { OrderStatus } from '../../../../domain/value-objects/OrderStatus.ts';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../../../../domain/value-objects/OrderStatus.ts';
import type { OrderEditFormData } from '../types/OrderPageTypes.ts';
import { GetOrderLabel } from '../utils/orderPresentationUtils.ts';

interface OrderEditModalProps {
  Order: Order;
  FormData: OrderEditFormData;
  OnChange: (patch: Partial<OrderEditFormData>) => void;
  OnClose: () => void;
  OnSubmit: (e: FormEvent) => void;
}

export const OrderEditModal = ({
  Order,
  FormData,
  OnChange,
  OnClose,
  OnSubmit,
}: OrderEditModalProps) => (
  <div className="orders-modal-overlay" onClick={OnClose}>
    <div className="orders-modal orders-modal--edit" onClick={(e) => e.stopPropagation()}>
      <div className="orders-modal__header">
        <div>
          <p className="orders-modal__eyebrow">Actualizar pedido</p>
          <h2 className="orders-modal__title">{GetOrderLabel(Order)}</h2>
        </div>
        <button type="button" className="orders-modal__close" onClick={OnClose} aria-label="Cerrar">
          ×
        </button>
      </div>

      <form onSubmit={OnSubmit} className="orders-modal__body">
        <div className="orders-form-group">
          <label htmlFor="order-status" className="orders-form-label">
            Estado del pedido
          </label>
          <select
            id="order-status"
            name="status"
            className="orders-form-select"
            value={FormData.status}
            onChange={(e) =>
              OnChange({
                status: e.target.value as OrderStatus,
                rejectionReason:
                  e.target.value === ORDER_STATUS.Rejected ? FormData.rejectionReason : '',
              })
            }
            required
          >
            <option value={ORDER_STATUS.Pending}>{ORDER_STATUS_LABELS.pending}</option>
            <option value={ORDER_STATUS.VerifyingPayment}>
              {ORDER_STATUS_LABELS.verifying_payment}
            </option>
            <option value={ORDER_STATUS.PaymentSuccessful}>
              {ORDER_STATUS_LABELS.payment_successful}
            </option>
            <option value={ORDER_STATUS.Rejected}>{ORDER_STATUS_LABELS.rejected}</option>
          </select>
        </div>

        {FormData.status === ORDER_STATUS.Rejected && (
          <div className="orders-form-group">
            <label htmlFor="order-rejection" className="orders-form-label">
              Motivo del rechazo *
            </label>
            <textarea
              id="order-rejection"
              name="rejectionReason"
              className="orders-form-textarea"
              value={FormData.rejectionReason}
              onChange={(e) => OnChange({ rejectionReason: e.target.value })}
              rows={4}
              placeholder="Ej. La captura de Yape no coincide con el monto del pedido..."
              required
            />
            <p className="orders-form-hint">
              El cliente verá este motivo en Mis pedidos junto con una nota para contactar al
              administrador.
            </p>
          </div>
        )}

        <div className="orders-modal__footer">
          <button type="submit" className="orders-btn orders-btn--primary">
            Guardar cambios
          </button>
          <button type="button" className="orders-btn orders-btn--ghost" onClick={OnClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
);
