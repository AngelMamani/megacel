import yapeLogo from '../../assets/yape.svg';
import yapeQr from '../../assets/yape.jpeg';
import './StoreYapePayment.css';

interface StoreYapePaymentProps {
  Variant?: 'inline' | 'card';
  Hint?: string;
  ShowQr?: boolean;
}

export const StoreYapePayment = ({
  Variant = 'card',
  Hint = 'Por ahora solo aceptamos pagos con Yape al confirmar tu pedido.',
  ShowQr = false,
}: StoreYapePaymentProps) => (
  <div className={`store-yape-payment store-yape-payment--${Variant}`} role="group" aria-label="Método de pago Yape">
    <span className="store-yape-payment__label">Método de pago</span>
    <div className="store-yape-payment__badge">
      <img src={yapeLogo} alt="Yape" width={38} height={24} className="store-yape-payment__logo" />
      <span className="store-yape-payment__name">Yape</span>
    </div>
    {ShowQr && (
      <div className="store-yape-payment__qr-wrap">
        <img src={yapeQr} alt="Código QR de Yape para pagar" className="store-yape-payment__qr" />
        <p className="store-yape-payment__qr-caption">Escanea y paga el total de tu pedido</p>
      </div>
    )}
    {Hint && <p className="store-yape-payment__hint">{Hint}</p>}
  </div>
);
