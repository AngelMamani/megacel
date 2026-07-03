import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStoreBrands } from '../hooks/useStoreBrands.ts';
import {
  IsStoreCatalogBrandsMobileViewport,
  useStoreCatalogBrandsMobileAutoplay,
} from '../hooks/useStoreCatalogBrandsAutoplay.ts';
import {
  ResolveStoreBrandCatalogId,
  StoreBrandLogoItems,
  type StoreBrandLogoItem,
} from '../utils/storeBrandLogos.ts';
import './StoreCatalogBrandsCarousel.css';

interface StoreCatalogBrandsCarouselProps {
  ActiveBrandId?: string;
  CategoryId?: string;
}

const MOBILE_MQ = '(max-width: 768px)';

const BuildBrandHref = (brandId: string, categoryId?: string) => {
  const params = new URLSearchParams();
  params.set('marca', brandId);
  if (categoryId) params.set('categoria', categoryId);
  return `/catalogo?${params.toString()}`;
};

const RenderLogoSlides = (
  items: StoreBrandLogoItem[],
  brands: Array<{ id: string; name: string }>,
  activeBrandId: string | undefined,
  categoryId: string | undefined,
  keySuffix = ''
) =>
  items.map((item) => {
    const brandId = ResolveStoreBrandCatalogId(item, brands);
    const isActive = Boolean(brandId && brandId === activeBrandId);

    return (
      <li key={`${item.key}${keySuffix}`} className="store-catalog-brands__slide">
        <Link
          to={BuildBrandHref(brandId, categoryId)}
          className={`store-catalog-brands__brand${isActive ? ' is-active' : ''}`}
          aria-label={`Ver productos de ${item.name}`}
          aria-current={isActive ? 'true' : undefined}
          draggable={false}
        >
          <span className="store-catalog-brands__circle">
            <img src={item.logo} alt={item.name} className="store-catalog-brands__logo" loading="lazy" draggable={false} />
          </span>
        </Link>
      </li>
    );
  });

export const StoreCatalogBrandsCarousel = ({
  ActiveBrandId,
  CategoryId,
}: StoreCatalogBrandsCarouselProps) => {
  const ViewportRef = useRef<HTMLDivElement>(null);
  const [IsMobile, setIsMobile] = useState(IsStoreCatalogBrandsMobileViewport);
  const { brands, isLoading } = useStoreBrands();
  const catalogBrands = brands.map((brand) => ({ id: brand.id, name: brand.name }));

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MQ);
    const OnChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', OnChange);
    return () => mediaQuery.removeEventListener('change', OnChange);
  }, []);

  useStoreCatalogBrandsMobileAutoplay(ViewportRef, IsMobile && !isLoading);

  if (!isLoading && catalogBrands.length === 0 && StoreBrandLogoItems.length === 0) return null;

  return (
    <section
      className={`store-catalog-brands${IsMobile ? ' store-catalog-brands--mobile' : ''}`}
      aria-label="Marcas disponibles"
    >
      {isLoading ? (
        <div className="store-catalog-brands__skeleton" aria-hidden>
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={`catalog-brand-skeleton-${index}`} className="store-catalog-brands__skeleton-circle" />
          ))}
        </div>
      ) : (
        <div
          ref={ViewportRef}
          className="store-catalog-brands__viewport"
        >
          <div className="store-catalog-brands__track">
            <ul className="store-catalog-brands__group">
              {RenderLogoSlides(StoreBrandLogoItems, catalogBrands, ActiveBrandId, CategoryId)}
            </ul>
            <ul className="store-catalog-brands__group" aria-hidden="true">
              {RenderLogoSlides(StoreBrandLogoItems, catalogBrands, ActiveBrandId, CategoryId, '-dup')}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};
