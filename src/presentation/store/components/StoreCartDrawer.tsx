import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.tsx';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import { useCart } from '../context/CartContext.tsx';
import type { Order } from '../../../domain/entities/Order.ts';
import type { CartItem } from '../types/CartTypes.ts';
import { PAYMENT_METHOD } from '../../../domain/value-objects/PaymentMethod.ts';
import { FormatStoreCurrency } from '../utils/storePresentationUtils.ts';
import { BuildOrderNotes } from '../utils/storeOrderNotes.ts';
import {
  BuildOrderWhatsAppMessage,
  BuildPendingPaymentWhatsAppMessage,
  BuildStoreWhatsAppUrl,
  type OrderWhatsAppSnapshot,
  type PendingCheckoutSnapshot,
} from '../utils/storeOrderWhatsApp.ts';
import { NormalizePeruPhoneInput, ValidatePeruPhone } from '../../../domain/value-objects/PeruPhone.ts';
import { formatOrderNumber } from '../../../domain/services/OrderNumberGenerator.ts';
import {
  StoreIconCart,
  StoreIconClose,
  StoreIconMinus,
  StoreIconPlus,
  StoreIconTrash,
  StoreIconTruck,
} from './StoreIcons.tsx';
import { StoreYapePayment } from './StoreYapePayment.tsx';
import './StoreCartDrawer.css';

type CartStep = 'cart' | 'checkout' | 'payment' | 'done';

export const StoreCartDrawer = () => {
  const { user, isAuthenticated, isCliente } = useAuth();
  const { application, repositories } = useInfrastructure();
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const [Step, setStep] = useState<CartStep>('cart');
  const [IsSubmitting, setIsSubmitting] = useState(false);
  const [Phone, setPhone] = useState('');
  const [Address, setAddress] = useState('');
  const [Reference, setReference] = useState('');
  const [PendingCheckout, setPendingCheckout] = useState<PendingCheckoutSnapshot | null>(null);
  const [ConfirmedOrder, setConfirmedOrder] = useState<OrderWhatsAppSnapshot | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setIsSubmitting(false);
      setPendingCheckout(null);
      setConfirmedOrder(null);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const PendingWhatsAppUrl = useMemo(() => {
    if (!PendingCheckout) return '';
    return BuildStoreWhatsAppUrl(BuildPendingPaymentWhatsAppMessage(PendingCheckout));
  }, [PendingCheckout]);

  const ConfirmedWhatsAppUrl = useMemo(() => {
    if (!ConfirmedOrder) return '';
    return BuildStoreWhatsAppUrl(BuildOrderWhatsAppMessage(ConfirmedOrder));
  }, [ConfirmedOrder]);

  const HandleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !isCliente || !user) {
      toast.error('Inicia sesión para continuar con tu compra');
      navigate('/login');
      closeCart();
      return;
    }

    if (!items.length) {
      toast.error('Tu carrito está vacío');
      return;
    }

    const phoneError = ValidatePeruPhone(Phone);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    const normalizedPhone = NormalizePeruPhoneInput(Phone);
    const orderItemsSnapshot: CartItem[] = items.map((item) => ({ ...item }));

    setPendingCheckout({
      CustomerName: user.name,
      CustomerEmail: user.email,
      Phone: normalizedPhone,
      Address,
      Reference,
      Total: subtotal,
      Items: orderItemsSnapshot,
    });

    setStep('payment');
    toast.success('Datos confirmados. Realiza el pago y envía tu captura por WhatsApp.');
  };

  const HandlePlaceOrder = async () => {
    if (!isAuthenticated || !isCliente || !user || !PendingCheckout) {
      toast.error('No se pudo procesar tu pedido');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingOrders = await new Promise<Order[]>((resolve, reject) => {
        const unsubscribe = repositories.order.subscribe(
          (orders) => {
            unsubscribe();
            resolve(orders);
          },
          (error) => {
            unsubscribe();
            reject(error);
          }
        );
      });

      if (!user.platformUserId) {
        throw new Error('No se pudo identificar tu cuenta de cliente');
      }

      const result = await application.customer.placeOnlineOrder.execute({
        platformUserId: user.platformUserId,
        customerName: PendingCheckout.CustomerName,
        customerEmail: PendingCheckout.CustomerEmail,
        customerPhone: PendingCheckout.Phone,
        shippingAddress: PendingCheckout.Address,
        paymentMethod: PAYMENT_METHOD.Yape,
        notes: BuildOrderNotes(PendingCheckout.Reference),
        items: PendingCheckout.Items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        existingOrders,
      });

      setConfirmedOrder({
        OrderId: result.order.id,
        OrderNumber: result.order.orderNumber,
        CustomerName: PendingCheckout.CustomerName,
        Phone: PendingCheckout.Phone,
        Address: PendingCheckout.Address,
        Reference: PendingCheckout.Reference,
        Total: result.order.total,
        Items: PendingCheckout.Items,
      });

      clearCart();
      setPendingCheckout(null);
      setStep('done');
      toast.success('¡Pedido realizado correctamente!');
    } catch (error) {
      console.error('Error al realizar pedido:', error);
      toast.error(error instanceof Error ? error.message : 'No se pudo realizar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const HandleOpenPendingWhatsApp = () => {
    if (!PendingWhatsAppUrl) return;
    window.open(PendingWhatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  const HandleOpenConfirmedWhatsApp = () => {
    if (!ConfirmedWhatsAppUrl) return;
    window.open(ConfirmedWhatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  const IsPostCheckoutStep = Step === 'payment' || Step === 'done';
  const ShowEmptyCart = items.length === 0 && !IsPostCheckoutStep;

  const HeadTitle =
    Step === 'payment' ? 'Pago con Yape' : Step === 'done' ? 'Pedido realizado' : 'Mi carrito';

  const HeadSubtitle =
    Step === 'payment'
      ? 'Paga y envía tu captura por WhatsApp'
      : Step === 'done'
        ? 'Tu compra fue registrada'
        : `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`;

  if (!isOpen) return null;

  return (
    <div className="store-cart" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      <button type="button" className="store-cart__backdrop" aria-label="Cerrar carrito" onClick={closeCart} />

      <aside className="store-cart__panel">
        <header className="store-cart__head">
          <div className="store-cart__title">
            <StoreIconCart />
            <div>
              <h2>{HeadTitle}</h2>
              <span>{HeadSubtitle}</span>
            </div>
          </div>
          <button type="button" className="store-cart__close" aria-label="Cerrar" onClick={closeCart}>
            <StoreIconClose />
          </button>
        </header>

        {!IsPostCheckoutStep && (
          <div className="store-cart__shipping">
            <StoreIconTruck />
            <p>
              <strong>Entrega en Puerto Maldonado</strong>
              <span>Envío dentro de la ciudad — coordinamos contigo por WhatsApp o llamada</span>
            </p>
          </div>
        )}

        {ShowEmptyCart ? (
          <div className="store-cart__empty">
            <div className="store-cart__empty-icon">
              <StoreIconCart />
            </div>
            <h3>Tu carrito está vacío</h3>
            <p>Explora el catálogo y agrega celulares, accesorios y más.</p>
            <Link to="/catalogo" className="store-cart__cta" onClick={closeCart}>
              Ir al catálogo
            </Link>
          </div>
        ) : Step === 'cart' ? (
          <>
            <ul className="store-cart__list">
              {items.map((item) => (
                <li key={item.productId} className="store-cart__item">
                  <div className="store-cart__item-media">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>Sin foto</span>
                    )}
                  </div>
                  <div className="store-cart__item-body">
                    <div className="store-cart__item-top">
                      <h3>{item.name}</h3>
                      <button
                        type="button"
                        className="store-cart__item-remove"
                        aria-label={`Quitar ${item.name}`}
                        onClick={() => removeItem(item.productId)}
                      >
                        <StoreIconTrash />
                      </button>
                    </div>
                    <div className="store-cart__item-footer">
                      <div className="store-cart__qty">
                        <button
                          type="button"
                          aria-label="Reducir cantidad"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <StoreIconMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                        >
                          <StoreIconPlus />
                        </button>
                      </div>
                      <strong>{FormatStoreCurrency(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="store-cart__footer">
              <div className="store-cart__summary">
                <span>Subtotal</span>
                <strong>{FormatStoreCurrency(subtotal)}</strong>
              </div>
              <p className="store-cart__note">El costo de envío se confirma al coordinar la entrega en Puerto Maldonado.</p>
              <StoreYapePayment Variant="inline" Hint="Pago con Yape en el siguiente paso." />
              <button
                type="button"
                className="store-cart__checkout-btn"
                onClick={() => {
                  if (!isAuthenticated || !isCliente) {
                    toast.error('Inicia sesión para continuar con tu compra');
                    navigate('/login');
                    closeCart();
                    return;
                  }
                  setStep('checkout');
                }}
              >
                Continuar compra
              </button>
            </footer>
          </>
        ) : Step === 'checkout' ? (
          <form className="store-cart__checkout" onSubmit={HandleContinueToPayment}>
            <button type="button" className="store-cart__back" onClick={() => setStep('cart')}>
              ← Volver al carrito
            </button>

            <h3>Datos de entrega</h3>
            <p className="store-cart__checkout-hint">
              Pedido para <strong>{user?.name}</strong> · {user?.email}
            </p>

            <label className="store-cart__field">
              <span>Celular de contacto</span>
              <input
                type="tel"
                value={Phone}
                onChange={(e) => setPhone(NormalizePeruPhoneInput(e.target.value))}
                placeholder="987654321"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="9[0-9]{8}"
                maxLength={9}
                title="Ingresa 9 dígitos. Debe comenzar con 9."
                required
              />
              <small className="store-cart__field-hint">9 dígitos, solo números (ej. 987654321)</small>
            </label>

            <label className="store-cart__field">
              <span>Dirección en Puerto Maldonado</span>
              <input
                type="text"
                value={Address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Av. Fitzcarrald 123, distrito..."
                required
              />
            </label>

            <label className="store-cart__field">
              <span>Referencia de entrega</span>
              <input
                type="text"
                value={Reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. Casa color verde, portón negro, frente al colegio..."
              />
            </label>

            <StoreYapePayment
              Variant="card"
              Hint="En el siguiente paso verás el QR de Yape para pagar y enviar tu captura."
            />

            <div className="store-cart__summary store-cart__summary--checkout">
              <span>Total a pagar</span>
              <strong>{FormatStoreCurrency(subtotal)}</strong>
            </div>

            <button type="submit" className="store-cart__checkout-btn">
              Confirmar datos y continuar
            </button>
          </form>
        ) : Step === 'payment' && PendingCheckout ? (
          <div className="store-cart__payment">
            <button type="button" className="store-cart__back" onClick={() => setStep('checkout')}>
              ← Volver a datos de entrega
            </button>

            <div className="store-cart__payment-summary">
              <h4>Resumen de tu compra</h4>
              <ul>
                {PendingCheckout.Items.map((item) => (
                  <li key={item.productId}>
                    <span>{item.name} x{item.quantity}</span>
                    <strong>{FormatStoreCurrency(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
              <div className="store-cart__summary store-cart__summary--checkout">
                <span>Total a pagar con Yape</span>
                <strong>{FormatStoreCurrency(PendingCheckout.Total)}</strong>
              </div>
            </div>

            <ol className="store-cart__payment-steps">
              <li>Escanea el QR y paga el total con Yape.</li>
              <li>Envía la captura del pago por WhatsApp.</li>
              <li>Pulsa <strong>Realizar pedido</strong> para registrar tu compra.</li>
            </ol>

            <StoreYapePayment
              Variant="card"
              ShowQr
              Hint="Escanea este código y paga el monto exacto del resumen."
            />

            <button type="button" className="store-cart__whatsapp-btn" onClick={HandleOpenPendingWhatsApp}>
              Enviar captura por WhatsApp
            </button>

            <button
              type="button"
              className="store-cart__checkout-btn"
              disabled={IsSubmitting}
              onClick={HandlePlaceOrder}
            >
              {IsSubmitting ? 'Registrando pedido...' : 'Realizar pedido'}
            </button>
          </div>
        ) : (
          ConfirmedOrder && (
            <div className="store-cart__payment">
              <div className="store-cart__payment-success">
                <h3>¡Pedido realizado!</h3>
                <p>
                  Tu pedido{' '}
                  <strong>
                    {ConfirmedOrder.OrderNumber
                      ? `#${formatOrderNumber(ConfirmedOrder.OrderNumber)}`
                      : ConfirmedOrder.OrderId}
                  </strong>{' '}
                  fue registrado correctamente.
                </p>
              </div>

              <div className="store-cart__payment-summary">
                <h4>Resumen</h4>
                <ul>
                  {ConfirmedOrder.Items.map((item) => (
                    <li key={item.productId}>
                      <span>{item.name} x{item.quantity}</span>
                      <strong>{FormatStoreCurrency(item.price * item.quantity)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="store-cart__summary store-cart__summary--checkout">
                  <span>Total pagado con Yape</span>
                  <strong>{FormatStoreCurrency(ConfirmedOrder.Total)}</strong>
                </div>
              </div>

              <button type="button" className="store-cart__whatsapp-btn" onClick={HandleOpenConfirmedWhatsApp}>
                Enviar comprobante con número de pedido
              </button>

              <Link
                to="/mis-pedidos"
                className="store-cart__orders-link"
                onClick={closeCart}
              >
                Ver mis pedidos
              </Link>
            </div>
          )
        )}
      </aside>
    </div>
  );
};
