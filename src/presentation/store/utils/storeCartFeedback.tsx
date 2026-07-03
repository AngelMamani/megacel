import toast, { type Toast } from 'react-hot-toast';
import './../components/StoreCartToast.css';

interface StoreCartToastProps {
  ToastInstance: Toast;
  Message: string;
  Variant: 'success' | 'error';
}

export const StoreCartToast = ({ ToastInstance, Message, Variant }: StoreCartToastProps) => (
  <div
    className={`store-cart-toast store-cart-toast--${Variant}${
      ToastInstance.visible ? ' is-visible' : ''
    }`}
    role="status"
  >
    <span className="store-cart-toast__message">{Message}</span>
    <button
      type="button"
      className="store-cart-toast__close"
      aria-label="Cerrar notificación"
      onClick={() => toast.dismiss(ToastInstance.id)}
    >
      ×
    </button>
  </div>
);

const ShowStoreCartToast = (message: string, variant: 'success' | 'error') => {
  toast.custom(
    (t) => <StoreCartToast ToastInstance={t} Message={message} Variant={variant} />,
    {
      duration: 2500,
      position: 'bottom-center',
    }
  );
};

export const NotifyCartAddResult = (productName: string, status: 'added' | 'no-stock' | 'max-reached') => {
  if (status === 'added') {
    ShowStoreCartToast(`${productName} agregado al carrito`, 'success');
    return;
  }

  if (status === 'max-reached') {
    ShowStoreCartToast('Ya agregaste todo el stock disponible de este producto', 'error');
    return;
  }

  ShowStoreCartToast('Este producto no tiene stock disponible', 'error');
};

export const DismissStoreCartToasts = () => {
  toast.dismiss();
};
