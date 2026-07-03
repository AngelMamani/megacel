import { Link } from 'react-router-dom';
import type { Product } from '../../../domain/entities/Product.ts';
import { GetNewArrivalTapeTone, StoreNewArrivalCard } from './StoreNewArrivalCard.tsx';

interface StoreNewArrivalsSectionProps {
  Products: Product[];
}

export const StoreNewArrivalsSection = ({ Products }: StoreNewArrivalsSectionProps) => {
  const displayProducts = Products.slice(0, 3);

  if (displayProducts.length === 0) {
    return (
      <section className="store-showcase__section store-showcase__section--new" id="recien-llegados">
        <div className="store-showcase__grid-overlay" aria-hidden />
        <div className="store-container store-showcase__inner">
          <p className="store-showcase__empty">Pronto habrá productos recién llegados.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="store-showcase__section store-showcase__section--new"
      id="recien-llegados"
      aria-labelledby="recien-llegados-title"
    >
      <div className="store-showcase__grid-overlay" aria-hidden />
      <div className="store-container store-showcase__inner">
        <header className="store-showcase__header">
          <h2 className="store-showcase__title" id="recien-llegados-title">
            Recién <span>llegados</span>
          </h2>
        </header>

        <div className="store-showcase-carousel" aria-label="Productos recién llegados">
          <div className="store-new-arrivals__grid store-showcase-carousel__track">
            {displayProducts.map((product, index) => (
              <StoreNewArrivalCard
                key={product.id}
                Product={product}
                TapeTone={GetNewArrivalTapeTone(index)}
              />
            ))}
          </div>
        </div>

        <div className="store-showcase__more">
          <Link to="/catalogo" className="store-showcase__link-btn">
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
};
