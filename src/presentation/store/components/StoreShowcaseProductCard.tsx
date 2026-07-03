import { Link } from 'react-router-dom';
import type { Product } from '../../../domain/entities/Product.ts';
import { useCart } from '../context/CartContext.tsx';
import { BuildStoreProductPath, FormatStoreCurrency } from '../utils/storePresentationUtils.ts';
import { NotifyCartAddResult } from '../utils/storeCartFeedback.tsx';
import { StoreIconCart, StoreIconPlus } from './StoreIcons.tsx';

interface StoreShowcaseProductCardProps {
  Product: Product;
  BadgeLabel?: string;
}

export const StoreShowcaseProductCard = ({ Product, BadgeLabel }: StoreShowcaseProductCardProps) => {
  const { addItem } = useCart();
  const image = Product.images?.[0];
  const hasDiscount = (Product.discount || 0) > 0;
  const inStock = Product.stock > 0;

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
    <article className="store-showcase-card">
      <Link
        to={BuildStoreProductPath(Product.id)}
        className="store-showcase-card__media-link"
        aria-label={`Ver ${Product.name}`}
      >
        <div className="store-showcase-card__media">
          {image ? (
            <img src={image} alt={Product.name} loading="lazy" />
          ) : (
            <div className="store-showcase-card__placeholder">Sin imagen</div>
          )}
          {BadgeLabel && <span className="store-showcase-card__badge">{BadgeLabel}</span>}
          {hasDiscount && !BadgeLabel && <span className="store-showcase-card__badge">Oferta</span>}
        </div>
      </Link>

      <div className="store-showcase-card__body">
        <h3>
          <Link to={BuildStoreProductPath(Product.id)}>{Product.name}</Link>
        </h3>
        <div className="store-showcase-card__pricing">
          {hasDiscount && (
            <span className="store-showcase-card__old">{FormatStoreCurrency(Product.price)}</span>
          )}
          <strong>{FormatStoreCurrency(Product.finalPrice)}</strong>
        </div>
        <span className={`store-showcase-card__stock ${inStock ? 'is-available' : 'is-empty'}`}>
          {inStock ? `${Product.stock} en stock` : 'Agotado'}
        </span>
        <button
          type="button"
          className="store-showcase-card__add"
          disabled={!inStock}
          onClick={HandleAddToCart}
        >
          <StoreIconCart />
          {inStock ? 'Agregar' : 'Sin stock'}
          {inStock && <StoreIconPlus />}
        </button>
      </div>
    </article>
  );
};
