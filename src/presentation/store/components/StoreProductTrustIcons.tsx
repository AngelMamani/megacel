import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  StoreIconChat,
  StoreIconChevronLeft,
  StoreIconChevronRight,
  StoreIconMapPin,
  StoreIconStar,
  StoreIconTruckFilled,
} from './StoreIcons.tsx';
import './StoreProductTrustIcons.css';

interface TrustItem {
  Id: string;
  Title: string;
  Description: string;
  Icon: ReactNode;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    Id: 'shipping',
    Title: 'Envío gratis',
    Description: 'Entregas sin costo adicional dentro de Puerto Maldonado al coordinar tu compra.',
    Icon: <StoreIconTruckFilled />,
  },
  {
    Id: 'pickup',
    Title: 'Retiro en tienda',
    Description: 'Recoge tu pedido directamente en nuestra tienda de Puerto Maldonado.',
    Icon: <StoreIconMapPin />,
  },
  {
    Id: 'quality',
    Title: 'Producto en buen estado',
    Description: 'Equipos revisados y en excelente condición antes de la entrega.',
    Icon: <StoreIconStar />,
  },
  {
    Id: 'support',
    Title: 'Atención personalizada',
    Description: 'Te asesoramos por WhatsApp o llamada en cada paso de tu compra.',
    Icon: <StoreIconChat />,
  },
];

export const StoreProductTrustIcons = () => {
  const TrackRef = useRef<HTMLUListElement>(null);
  const [CanScrollPrev, setCanScrollPrev] = useState(false);
  const [CanScrollNext, setCanScrollNext] = useState(false);

  const UpdateScrollState = useCallback(() => {
    const track = TrackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(maxScroll > 4 && track.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const track = TrackRef.current;
    if (!track) return undefined;

    UpdateScrollState();
    track.addEventListener('scroll', UpdateScrollState, { passive: true });
    window.addEventListener('resize', UpdateScrollState);

    return () => {
      track.removeEventListener('scroll', UpdateScrollState);
      window.removeEventListener('resize', UpdateScrollState);
    };
  }, [UpdateScrollState]);

  const ScrollByStep = (direction: 'prev' | 'next') => {
    const track = TrackRef.current;
    if (!track) return;

    const step = Math.max(track.clientWidth * 0.85, 240);
    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  return (
    <section className="store-product-trust" aria-label="Beneficios de compra">
      <div className="store-container store-product-trust__shell">
        <div className="store-product-trust__carousel">
          <div className="store-product-trust__nav">
            <button
              type="button"
              className="store-product-trust__nav-btn"
              aria-label="Anterior"
              disabled={!CanScrollPrev}
              onClick={() => ScrollByStep('prev')}
            >
              <StoreIconChevronLeft />
            </button>
            <button
              type="button"
              className="store-product-trust__nav-btn"
              aria-label="Siguiente"
              disabled={!CanScrollNext}
              onClick={() => ScrollByStep('next')}
            >
              <StoreIconChevronRight />
            </button>
          </div>

          <ul ref={TrackRef} className="store-product-trust__track">
            {TRUST_ITEMS.map((item) => (
              <li key={item.Id} className="store-product-trust__item">
                <span className="store-product-trust__icon" aria-hidden>
                  {item.Icon}
                </span>
                <div className="store-product-trust__text">
                  <p className="store-product-trust__title">{item.Title}</p>
                  <p className="store-product-trust__description">{item.Description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
