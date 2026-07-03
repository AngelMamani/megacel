import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useInfrastructure } from '../../../providers/DependencyProvider.tsx';
import type { Order } from '../../../../domain/entities/Order.ts';
import {
  FormatStoreCurrency,
  FormatStoreDate,
  GetOrderStatusLabel,
  GetOrderStatusTone,
  isPaymentSuccessfulOrder,
  isRejectedOrder,
} from '../../utils/storePresentationUtils.ts';
import { formatOrderNumber } from '../../../../domain/services/OrderNumberGenerator.ts';
import { GetOrderSortTimestamp } from '../../../../domain/value-objects/PeruDateTime.ts';
import {
  BuildRejectedOrderWhatsAppMessage,
  BuildStoreWhatsAppUrl,
} from '../../utils/storeOrderWhatsApp.ts';
import {
  StoreProductReviewModal,
  type StoreProductReviewTarget,
} from '../../components/StoreProductReviewModal.tsx';
import './StoreOrders.css';
import '../../styles/Store.css';

export const StoreOrders = () => {
  const { user } = useAuth();
  const { repositories } = useInfrastructure();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<StoreProductReviewTarget | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.email) return;

    const unsubscribe = repositories.order.subscribeByCustomerEmail(
      user.email,
      (items) => {
        const sorted = [...items].sort(
          (a, b) => GetOrderSortTimestamp(b) - GetOrderSortTimestamp(a)
        );
        setOrders(sorted);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );

    return () => unsubscribe();
  }, [repositories.order, user?.email]);

  useEffect(() => {
    if (!user?.platformUserId) {
      setReviewedProductIds(new Set());
      return;
    }

    const unsubscribe = repositories.productReview.subscribePublished(
      (reviews) => {
        const ids = new Set(
          reviews
            .filter((review) => review.platformUserId === user.platformUserId)
            .map((review) => review.productId)
        );
        setReviewedProductIds(ids);
      },
      () => setReviewedProductIds(new Set())
    );

    return () => unsubscribe();
  }, [repositories.productReview, user?.platformUserId]);

  const HandleContactAdminWhatsApp = (order: Order) => {
    const url = BuildStoreWhatsAppUrl(
      BuildRejectedOrderWhatsAppMessage({
        OrderId: order.id,
        OrderNumber: order.orderNumber,
        CustomerName: order.customerName,
        CustomerPhone: order.customerPhone,
        ShippingAddress: order.shippingAddress,
        Notes: order.notes,
        RejectionReason: order.rejectionReason || 'No se indicó un motivo específico.',
        Total: order.total,
        Items:
          order.orderItems?.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            subtotal: item.subtotal ?? item.price * item.quantity,
          })) ?? [],
      })
    );

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const HandleOpenReview = (item: { id: string; productName: string }, orderId: string) => {
    setReviewTarget({
      ProductId: item.id,
      ProductName: item.productName,
      OrderId: orderId,
    });
  };

  const HandleCloseReview = useCallback(() => {
    setReviewTarget(null);
  }, []);

  const HandleReviewSubmitted = useCallback((productId: string) => {
    setReviewedProductIds((current) => new Set(current).add(productId));
  }, []);

  return (
    <section className="store-orders">
      <div className="store-container">
        <header className="store-orders__header">
          <h1>Mis pedidos</h1>
        </header>

        {isLoading ? (
          <div className="store-empty">
            <h3>Cargando pedidos...</h3>
          </div>
        ) : orders.length === 0 ? (
          <div className="store-empty">
            <h3>Aún no tienes pedidos</h3>
            <Link to="/catalogo" className="store-btn store-btn--primary" style={{ marginTop: '1rem' }}>
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="store-orders__list">
            {orders.map((order) => {
              const tone = GetOrderStatusTone(order.status);
              const rejected = isRejectedOrder(order.status);
              const paymentSuccessful = isPaymentSuccessfulOrder(order.status);
              const orderLabel = order.orderNumber
                ? `#${formatOrderNumber(order.orderNumber)}`
                : order.id;

              return (
                <article
                  key={order.id}
                  className={`store-order-card${rejected ? ' store-order-card--rejected' : ''}`}
                >
                  <div className="store-order-card__top">
                    <div>
                      <span className="store-order-card__id">Pedido {orderLabel}</span>
                      <p className="store-order-card__date">
                        {FormatStoreDate(order.createdAt ?? order.date)}
                      </p>
                    </div>
                    <span className={`store-badge store-badge--${tone}`}>
                      {GetOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <ul className="store-order-card__items">
                      {order.orderItems.map((item, index) => {
                        const alreadyReviewed = reviewedProductIds.has(item.id);

                        return (
                          <li key={`${order.id}-${index}`}>
                            <div className="store-order-card__item-main">
                              <span>{item.quantity}x {item.productName}</span>
                              <strong>{FormatStoreCurrency(item.subtotal ?? item.price * item.quantity)}</strong>
                            </div>
                            {paymentSuccessful && !alreadyReviewed && (
                              <button
                                type="button"
                                className="store-order-card__rate-btn"
                                onClick={() => HandleOpenReview(item, order.id)}
                              >
                                Valorar producto
                              </button>
                            )}
                            {paymentSuccessful && alreadyReviewed && (
                              <span className="store-order-card__reviewed">Ya valoraste este producto</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="store-order-card__total">
                    <span>Total</span>
                    <strong>{FormatStoreCurrency(order.total)}</strong>
                  </div>

                  {rejected && (
                    <div className="store-order-card__rejection" role="alert">
                      <p>{order.rejectionReason || 'Tu pedido fue rechazado.'}</p>
                      <button
                        type="button"
                        className="store-order-card__whatsapp-btn"
                        onClick={() => HandleContactAdminWhatsApp(order)}
                      >
                        Contactar por WhatsApp
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <StoreProductReviewModal
        Target={reviewTarget}
        HasExistingReview={reviewTarget ? reviewedProductIds.has(reviewTarget.ProductId) : false}
        OnClose={HandleCloseReview}
        OnSubmitted={HandleReviewSubmitted}
      />
    </section>
  );
};
