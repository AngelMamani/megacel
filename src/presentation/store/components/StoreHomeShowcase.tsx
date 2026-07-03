import { Link } from 'react-router-dom';
import type { Product } from '../../../domain/entities/Product.ts';
import { useStoreHomeProducts } from '../hooks/useStoreHomeProducts.ts';
import { StoreNewArrivalsSection } from './StoreNewArrivalsSection.tsx';
import { StoreShowcaseProductCard } from './StoreShowcaseProductCard.tsx';
import './StoreHomeShowcase.css';

interface StoreBestsellersSectionProps {
  Products: Product[];
}

const StoreBestsellersSection = ({ Products }: StoreBestsellersSectionProps) => (
  <section
    className="store-showcase__section store-showcase__section--bestsellers"
    id="mas-vendidos"
    aria-labelledby="mas-vendidos-title"
  >
    <div className="store-showcase__grid-overlay" aria-hidden />
    <div className="store-container store-showcase__inner">
      <header className="store-showcase__header">
        <span className="store-showcase__tagline">FAVORITOS</span>
        <h2 className="store-showcase__title" id="mas-vendidos-title">
          Los más <span>vendidos</span>
        </h2>
        <p className="store-showcase__subtitle">Los productos que más eligen nuestros clientes</p>
      </header>

      {Products.length === 0 ? (
        <p className="store-showcase__empty">Pronto habrá productos en esta sección.</p>
      ) : (
        <>
          <div className="store-showcase-carousel" aria-label="Productos más vendidos">
            <div className="store-showcase__grid store-showcase-carousel__track">
              {Products.map((product) => (
                <StoreShowcaseProductCard key={product.id} Product={product} BadgeLabel="Top" />
              ))}
            </div>
          </div>
          <div className="store-showcase__more">
            <Link to="/catalogo" className="store-showcase__link-btn">
              Ver catálogo completo
            </Link>
          </div>
        </>
      )}
    </div>
  </section>
);

export const StoreHomeShowcase = () => {
  const { newArrivals, bestSellers, isLoading } = useStoreHomeProducts();

  if (isLoading) {
    return (
      <div className="store-home-showcase store-home-showcase--flush-top">
        <div className="store-container store-showcase__loading-wrap">
          <p className="store-showcase__loading">Cargando productos destacados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-home-showcase store-home-showcase--flush-top">
      <StoreNewArrivalsSection Products={newArrivals} />
      <StoreBestsellersSection Products={bestSellers} />
    </div>
  );
};
