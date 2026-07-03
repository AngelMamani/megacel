import { Link } from 'react-router-dom';
import type { Product } from '../../../../domain/entities/Product.ts';
import { useCart } from '../../context/CartContext.tsx';
import { BuildStoreProductPath, FormatStoreCurrency } from '../../utils/storePresentationUtils.ts';
import { NotifyCartAddResult } from '../../utils/storeCartFeedback.tsx';
import { StoreIconCart, StoreIconPlus } from '../../components/StoreIcons.tsx';

interface StoreCatalogProductCardProps {
  Product: Product;
}

export const StoreCatalogProductCard = ({ Product }: StoreCatalogProductCardProps) => {
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
    <article className="store-catalog-card">
      <Link
        to={BuildStoreProductPath(Product.id)}
        className="store-catalog-card__media-link"
        aria-label={`Ver ${Product.name}`}
      >
        <div className="store-catalog-card__media">
          {image ? (
            <img src={image} alt={Product.name} loading="lazy" />
          ) : (
            <div className="store-catalog-card__placeholder">Sin imagen</div>
          )}
          {hasDiscount && <span className="store-catalog-card__badge">Oferta</span>}
        </div>
      </Link>

      <div className="store-catalog-card__body">
        <h3>
          <Link to={BuildStoreProductPath(Product.id)}>{Product.name}</Link>
        </h3>
        {Product.shortDescription && (
          <p className="store-catalog-card__desc">{Product.shortDescription}</p>
        )}
        <div className="store-catalog-card__pricing">
          {hasDiscount && (
            <span className="store-catalog-card__old">{FormatStoreCurrency(Product.price)}</span>
          )}
          <strong>{FormatStoreCurrency(Product.finalPrice)}</strong>
        </div>
        <span className={`store-catalog-card__stock ${inStock ? 'is-available' : 'is-empty'}`}>
          {inStock ? `${Product.stock} en stock` : 'Agotado'}
        </span>
        <button
          type="button"
          className="store-catalog-card__add"
          disabled={!inStock}
          onClick={HandleAddToCart}
        >
          <StoreIconCart />
          {inStock ? 'Agregar al carrito' : 'Sin stock'}
          {inStock && <StoreIconPlus />}
        </button>
      </div>
    </article>
  );
};

interface StoreCatalogActiveFilterProps {
  Label: string;
  ClearTo: string;
}

export const StoreCatalogActiveFilter = ({ Label, ClearTo }: StoreCatalogActiveFilterProps) => (
  <Link to={ClearTo} className="store-catalog__filter-chip">
    {Label}
    <span aria-hidden>×</span>
  </Link>
);
