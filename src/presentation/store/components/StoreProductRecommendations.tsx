import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '../../../domain/entities/Product.ts';
import { useStoreProductRecommendations } from '../hooks/useStoreProductRecommendations.ts';
import { StoreIconChevronLeft, StoreIconChevronRight } from './StoreIcons.tsx';
import { StoreRecommendationProductCard } from './StoreRecommendationProductCard.tsx';
import './StoreProductRecommendations.css';

interface StoreProductRecommendationsProps {
  Product: Product;
}

export const StoreProductRecommendations = ({ Product }: StoreProductRecommendationsProps) => {
  const { recommendations, brandMap, isLoading } = useStoreProductRecommendations(Product);
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
  }, [UpdateScrollState, recommendations.length, isLoading]);

  const ScrollByStep = (direction: 'prev' | 'next') => {
    const track = TrackRef.current;
    if (!track) return;

    const step = Math.max(track.clientWidth * 0.82, 260);
    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  if (isLoading || recommendations.length === 0) return null;

  const ShowNav = recommendations.length > 5;

  return (
    <section className="store-product-recommendations" aria-labelledby="store-product-recommendations-title">
      <div className="store-container store-product-recommendations__shell">
        <header className="store-product-recommendations__header">
          <h2 id="store-product-recommendations-title" className="store-product-recommendations__title">
            Te podría interesar
          </h2>
        </header>

        <div
          className={`store-product-recommendations__carousel${ShowNav ? ' store-product-recommendations__carousel--has-nav' : ''}`}
        >
          {ShowNav && (
            <div className="store-product-recommendations__nav store-product-recommendations__nav--side">
              <button
                type="button"
                className="store-product-recommendations__nav-btn"
                aria-label="Anterior"
                disabled={!CanScrollPrev}
                onClick={() => ScrollByStep('prev')}
              >
                <StoreIconChevronLeft />
              </button>
              <button
                type="button"
                className="store-product-recommendations__nav-btn"
                aria-label="Siguiente"
                disabled={!CanScrollNext}
                onClick={() => ScrollByStep('next')}
              >
                <StoreIconChevronRight />
              </button>
            </div>
          )}

          <ul ref={TrackRef} className="store-product-recommendations__track">
            {recommendations.map((item) => (
              <li key={item.id} className="store-product-recommendations__item">
                <StoreRecommendationProductCard
                  Product={item}
                  BrandName={brandMap.get(item.brandId)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
