import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  StoreIconBox,
  StoreIconChat,
  StoreIconChevronLeft,
  StoreIconChevronRight,
  StoreIconDollar,
  StoreIconGrid,
} from './StoreIcons.tsx';
import './StoreServiceHighlights.css';

interface ServiceHighlightItem {
  Id: string;
  Title: string;
  Description: string;
  Icon: ReactNode;
}

const SERVICE_HIGHLIGHTS: ServiceHighlightItem[] = [
  {
    Id: 'support',
    Title: 'Soporte 24/7',
    Description: 'Brindamos atención personalizada.',
    Icon: <StoreIconChat />,
  },
  {
    Id: 'shipping',
    Title: 'Envíos eficientes',
    Description: 'Coordinamos entregas en Puerto Maldonado y la región.',
    Icon: <StoreIconBox />,
  },
  {
    Id: 'interface',
    Title: 'Interfaz intuitiva al Usuario',
    Description: 'Navega, compara y compra con facilidad desde cualquier dispositivo.',
    Icon: <StoreIconGrid />,
  },
  {
    Id: 'pricing',
    Title: 'Precios competitivos',
    Description: 'Los más bajos del mercado.',
    Icon: <StoreIconDollar />,
  },
];

export const StoreServiceHighlights = () => {
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
    <section className="store-service-highlights" aria-label="Beneficios de MEGA CEL">
      <div className="store-container store-service-highlights__shell">
        <div className="store-service-highlights__carousel">
          <div className="store-service-highlights__nav">
            <button
              type="button"
              className="store-service-highlights__nav-btn"
              aria-label="Anterior"
              disabled={!CanScrollPrev}
              onClick={() => ScrollByStep('prev')}
            >
              <StoreIconChevronLeft />
            </button>
            <button
              type="button"
              className="store-service-highlights__nav-btn"
              aria-label="Siguiente"
              disabled={!CanScrollNext}
              onClick={() => ScrollByStep('next')}
            >
              <StoreIconChevronRight />
            </button>
          </div>

          <ul ref={TrackRef} className="store-service-highlights__track">
            {SERVICE_HIGHLIGHTS.map((item) => (
              <li key={item.Id} className="store-service-highlights__item">
                <span className="store-service-highlights__icon" aria-hidden>
                  {item.Icon}
                </span>
                <div className="store-service-highlights__text">
                  <p className="store-service-highlights__title">{item.Title}</p>
                  <p className="store-service-highlights__description">{item.Description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
