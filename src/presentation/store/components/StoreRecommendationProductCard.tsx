import { Link } from 'react-router-dom';
import type { Product } from '../../../domain/entities/Product.ts';
import { useCart } from '../context/CartContext.tsx';
import { StoreIconCart } from './StoreIcons.tsx';
import { BuildStoreProductPath, FormatStoreCurrency } from '../utils/storePresentationUtils.ts';
import { NotifyCartAddResult } from '../utils/storeCartFeedback.tsx';

interface StoreRecommendationProductCardProps {
  Product: Product;
  BrandName?: string;
}

const GetDiscountPercent = (product: Product) => {
  const hasDiscount = (product.discount || 0) > 0;
  if (!hasDiscount) return 0;
  if (product.discountPercentage) return Math.round(product.discountPercentage);
  if (product.price <= 0) return 0;
  return Math.round((1 - product.finalPrice / product.price) * 100);
};

const GetStockLabel = (stock: number) => {
  if (stock <= 0) return { text: 'Agotado', level: 'empty' as const };
  if (stock <= 1) return { text: `Muy poca disponibilidad (${stock} unidad)`, level: 'very-low' as const };
  if (stock <= 5) return { text: `Poca disponibilidad (${stock} unidades)`, level: 'low' as const };
  return { text: 'Disponibles', level: 'normal' as const };
};

export const StoreRecommendationProductCard = ({
  Product,
  BrandName,
}: StoreRecommendationProductCardProps) => {
  const { addItem } = useCart();
  const image = Product.images?.[0];
  const hasDiscount = (Product.discount || 0) > 0;
  const discountPercent = GetDiscountPercent(Product);
  const inStock = Product.stock > 0;
  const stockLabel = GetStockLabel(Product.stock);

  const HandleAddToCart = () => {
    const status = addItem({
      id: Product.id,
      sku: Product.sku,
      name: Product.name,
      finalPrice: Product.finalPrice,
      stock: Product.stock,
      images: Product.images,
    });

    NotifyCartAddResult(Product.name, status);
  };

  return (
    <article className="store-recommendation-card">
      <Link
        to={BuildStoreProductPath(Product.id)}
        className="store-recommendation-card__media-link"
        aria-label={`Ver ${Product.name}`}
      >
        <div className="store-recommendation-card__media">
          {image ? (
            <img src={image} alt={Product.name} loading="lazy" />
          ) : (
            <div className="store-recommendation-card__placeholder">Sin imagen</div>
          )}
          {hasDiscount && discountPercent > 0 && (
            <span className="store-recommendation-card__sale-badge">{discountPercent}% de descuento</span>
          )}
        </div>
      </Link>

      <div className="store-recommendation-card__body">
        <div className="store-recommendation-card__meta">
          {BrandName && <p className="store-recommendation-card__brand">{BrandName}</p>}
          {Product.sku && <p className="store-recommendation-card__sku">SKU: {Product.sku}</p>}
        </div>

        <h3 className="store-recommendation-card__title">
          <Link to={BuildStoreProductPath(Product.id)}>{Product.name}</Link>
        </h3>

        <div className="store-recommendation-card__price">
          <strong>{FormatStoreCurrency(Product.finalPrice)}</strong>
          {hasDiscount && <s>{FormatStoreCurrency(Product.price)}</s>}
        </div>

        <p className={`store-recommendation-card__stock is-${stockLabel.level}`}>{stockLabel.text}</p>

        <div className="store-recommendation-card__actions">
          <button
            type="button"
            className="store-recommendation-card__add"
            disabled={!inStock}
            onClick={HandleAddToCart}
          >
            <StoreIconCart />
            {inStock ? 'Agregar al carrito' : 'Sin stock'}
          </button>
          <Link to={BuildStoreProductPath(Product.id)} className="store-recommendation-card__view">
            Ver información
          </Link>
        </div>
      </div>
    </article>
  );
};
