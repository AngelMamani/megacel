import type { Order } from '../../../../domain/entities/Order.ts';
import { isRejectedOrder } from '../../../../domain/value-objects/OrderStatus.ts';
import {
  FormatCurrency,
  FormatOrderDate,
  FormatOrderDateTime,
  GetOrderLabel,
} from '../utils/orderPresentationUtils.ts';
import { OrderStatusBadge } from './OrderStatusBadge.tsx';

interface OrderViewModalProps {
  Order: Order;
  OnClose: () => void;
  OnEdit: () => void;
}

export const OrderViewModal = ({ Order, OnClose, OnEdit }: OrderViewModalProps) => (
  <div className="orders-modal-overlay" onClick={OnClose}>
    <div className="orders-modal orders-modal--view" onClick={(e) => e.stopPropagation()}>
      <div className="orders-modal__header">
        <div>
          <p className="orders-modal__eyebrow">Detalle del pedido</p>
          <h2 className="orders-modal__title">{GetOrderLabel(Order)}</h2>
        </div>
        <button type="button" className="orders-modal__close" onClick={OnClose} aria-label="Cerrar">
          ×
        </button>
      </div>

      <div className="orders-modal__body">
        <section className="orders-detail-section">
          <h3>Información del pedido</h3>
          <div className="orders-detail-grid">
            <div className="orders-detail-item">
              <span className="orders-detail-label">Estado</span>
              <OrderStatusBadge Status={Order.status} />
            </div>
            <div className="orders-detail-item">
              <span className="orders-detail-label">Fecha</span>
              <span className="orders-detail-value">{FormatOrderDate(Order.date)}</span>
            </div>
            <div className="orders-detail-item">
              <span className="orders-detail-label">Total</span>
              <span className="orders-detail-value orders-detail-value--total">
                {FormatCurrency(Order.total)}
              </span>
            </div>
            <div className="orders-detail-item">
              <span className="orders-detail-label">Referencia</span>
              <span className="orders-detail-value orders-detail-value--mono">{Order.id}</span>
            </div>
          </div>
        </section>

        <section className="orders-detail-section">
          <h3>Cliente</h3>
          <div className="orders-detail-grid">
            <div className="orders-detail-item">
              <span className="orders-detail-label">Nombre</span>
              <span className="orders-detail-value">{Order.customerName}</span>
            </div>
            {Order.customerEmail && (
              <div className="orders-detail-item">
                <span className="orders-detail-label">Email</span>
                <span className="orders-detail-value">{Order.customerEmail}</span>
              </div>
            )}
            {Order.customerPhone && (
              <div className="orders-detail-item">
                <span className="orders-detail-label">Teléfono</span>
                <span className="orders-detail-value">{Order.customerPhone}</span>
              </div>
            )}
            {Order.shippingAddress && (
              <div className="orders-detail-item orders-detail-item--wide">
                <span className="orders-detail-label">Dirección</span>
                <span className="orders-detail-value">{Order.shippingAddress}</span>
              </div>
            )}
          </div>
        </section>

        {Order.orderItems && Order.orderItems.length > 0 && (
          <section className="orders-detail-section">
            <h3>Artículos</h3>
            <div className="orders-items-table-wrap">
              <table className="orders-items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{FormatCurrency(item.price)}</td>
                      <td>{FormatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Total</td>
                    <td>{FormatCurrency(Order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}

        {Order.paymentMethod && (
          <section className="orders-detail-section">
            <h3>Pago</h3>
            <div className="orders-detail-grid">
              <div className="orders-detail-item">
                <span className="orders-detail-label">Método</span>
                <span className="orders-detail-value">{Order.paymentMethod}</span>
              </div>
            </div>
          </section>
        )}

        {Order.notes && (
          <section className="orders-detail-section">
            <h3>Notas de entrega</h3>
            <p className="orders-detail-notes">{Order.notes}</p>
          </section>
        )}

        {isRejectedOrder(Order.status) && Order.rejectionReason && (
          <section className="orders-detail-section orders-detail-section--rejected">
            <h3>Motivo del rechazo</h3>
            <p className="orders-detail-notes">{Order.rejectionReason}</p>
          </section>
        )}

        {(Order.createdAt || Order.updatedAt) && (
          <section className="orders-detail-section orders-detail-section--meta">
            <div className="orders-detail-grid">
              {Order.createdAt && (
                <div className="orders-detail-item">
                  <span className="orders-detail-label">Creado</span>
                  <span className="orders-detail-value">{FormatOrderDateTime(Order.createdAt)}</span>
                </div>
              )}
              {Order.updatedAt && (
                <div className="orders-detail-item">
                  <span className="orders-detail-label">Actualizado</span>
                  <span className="orders-detail-value">{FormatOrderDateTime(Order.updatedAt)}</span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="orders-modal__footer">
        <button type="button" className="orders-btn orders-btn--primary" onClick={OnEdit}>
          Editar estado
        </button>
        <button type="button" className="orders-btn orders-btn--ghost" onClick={OnClose}>
          Cerrar
        </button>
      </div>
    </div>
  </div>
);
