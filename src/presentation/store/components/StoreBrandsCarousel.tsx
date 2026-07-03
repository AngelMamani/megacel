import { Link } from 'react-router-dom';
import { useStoreBrands } from '../hooks/useStoreBrands.ts';
import {
  ResolveStoreBrandCatalogId,
  StoreBrandLogoItems,
  type StoreBrandLogoItem,
} from '../utils/storeBrandLogos.ts';
import './StoreBrandsCarousel.css';

const RenderLogoSlides = (
  items: StoreBrandLogoItem[],
  brands: Array<{ id: string; name: string }>,
  keySuffix = ''
) =>
  items.map((item) => {
    const brandId = ResolveStoreBrandCatalogId(item, brands);
    const href = `/catalogo?marca=${encodeURIComponent(brandId)}`;

    return (
      <li key={`${item.key}${keySuffix}`} className="store-brands-carousel__slide">
        <Link
          to={href}
          className="store-brands-carousel__brand"
          aria-label={`Ver productos de ${item.name}`}
        >
          <img
            src={item.logo}
            alt={item.name}
            className="store-brands-carousel__logo"
            loading="lazy"
          />
        </Link>
      </li>
    );
  });

export const StoreBrandsCarousel = () => {
  const { brands, isLoading } = useStoreBrands();
  const catalogBrands = brands.map((brand) => ({ id: brand.id, name: brand.name }));

  if (isLoading) {
    return (
      <section className="store-brands-carousel" aria-label="Marcas disponibles">
        <div className="store-container store-brands-carousel__head">
          <h2>Marcas que ofrecemos</h2>
        </div>
        <div className="store-brands-carousel__skeleton" aria-hidden>
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={`brand-skeleton-${index}`} className="store-brands-carousel__skeleton-item" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="store-brands-carousel" aria-label="Marcas disponibles">
      <div className="store-container store-brands-carousel__head">
        <h2>Marcas que ofrecemos</h2>
      </div>

      <div className="store-brands-carousel__viewport">
        <div className="store-brands-carousel__track">
          <ul className="store-brands-carousel__group">
            {RenderLogoSlides(StoreBrandLogoItems, catalogBrands)}
          </ul>
          <ul className="store-brands-carousel__group" aria-hidden="true">
            {RenderLogoSlides(StoreBrandLogoItems, catalogBrands, '-dup')}
          </ul>
        </div>
      </div>
    </section>
  );
};
