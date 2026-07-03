import type { CSSProperties, MouseEvent } from 'react';
import type { Product } from '../../../../domain/entities/Product.ts';
import type { BrandOption, CategoryOption } from '../types/ProductPageTypes.ts';
import { FormatDateTime, GetStockLevel } from '../utils/productPresentationUtils.ts';
import { IconEdit, IconTrash } from './ProductIcons.tsx';

interface ProductCardProps {
  Product: Product;
  Index: number;
  IsPending: boolean;
  IsSelected: boolean;
  Category?: CategoryOption;
  Brand?: BrandOption;
  FormatCurrency: (amount: number) => string;
  CalculateDiscountPercentage: (price: number, discount: number) => number;
  OnSelect: (product: Product) => void;
  OnEdit: (product: Product) => void;
  OnDelete: (product: Product) => void;
}

export const ProductCard = ({
  Product,
  Index,
  IsPending,
  IsSelected,
  Category,
  Brand,
  FormatCurrency,
  CalculateDiscountPercentage,
  OnSelect,
  OnEdit,
  OnDelete,
}: ProductCardProps) => {
  const HandleBodyClick = () => {
    if (IsPending) return;
    OnSelect(Product);
    OnEdit(Product);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();
  const finalPrice = Product.finalPrice || Product.price;
  const hasDiscount = Product.discount && Product.discount > 0 && finalPrice < Product.price;
  const stockLevel = GetStockLevel(Product.stock, Product.minStock);
  const imageUrl = Product.images?.[0];

  return (
    <article
      className={`product-card${IsPending ? ' product-card--pending' : ''}${IsSelected ? ' product-card--selected' : ''}`}
      style={{ '--card-delay': `${Math.min(Index * 60, 480)}ms` } as CSSProperties}
      onClick={HandleBodyClick}
      role="button"
      tabIndex={IsPending ? -1 : 0}
      onKeyDown={(e) => {
        if (IsPending) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          HandleBodyClick();
        }
      }}
      aria-label={`Editar producto ${Product.name}`}
    >
      <div className="product-card__media">
        {imageUrl ? (
          <img src={imageUrl} alt={Product.name} className="product-card__image" loading="lazy" />
        ) : (
          <div
            className="product-card__placeholder"
            style={{ background: Category?.gradient || 'linear-gradient(135deg, #fbcfe8, #f472b6)' }}
          >
            {Product.name.charAt(0)}
          </div>
        )}
        <div className="product-card__media-overlay" aria-hidden="true" />
        <div className="product-card__edit-hint" aria-hidden="true">
          <IconEdit size={18} />
          <span>Clic para editar</span>
        </div>

        <div className="product-card__chips">
          {IsPending && (
            <span className="product-card__chip product-card__chip--pending">
              <span className="product-card__spinner" aria-hidden="true" />
              Sincronizando
            </span>
          )}
          {Product.images && Product.images.length > 1 && (
            <span className="product-card__chip">+{Product.images.length - 1} imgs</span>
          )}
          {hasDiscount && (
            <span className="product-card__chip product-card__chip--discount">
              -
              {Product.discountPercentage?.toFixed(0) ||
                CalculateDiscountPercentage(Product.price, Product.discount || 0).toFixed(0)}
              %
            </span>
          )}
        </div>
      </div>

      <div className="product-card__body">
        <header className="product-card__header">
          <h3 className="product-card__name">{Product.name}</h3>
          <span className="product-card__sku">SKU: {Product.sku}</span>
        </header>

        {Product.shortDescription && (
          <p className="product-card__description">{Product.shortDescription}</p>
        )}

        <div className="product-card__tags">
          {Category && (
            <span className="product-card__tag" style={{ '--tag-color': Category.color } as CSSProperties}>
              {Category.name}
            </span>
          )}
          {Brand && (
            <span className="product-card__tag" style={{ '--tag-color': Brand.color } as CSSProperties}>
              {Brand.name}
            </span>
          )}
        </div>

        <div className="product-card__metrics">
          <div className="product-card__metric">
            {hasDiscount ? (
              <>
                <strong>{FormatCurrency(finalPrice)}</strong>
                <span className="product-card__price-old">{FormatCurrency(Product.price)}</span>
              </>
            ) : (
              <strong>{FormatCurrency(finalPrice)}</strong>
            )}
            <span>precio</span>
          </div>
          <div className={`product-card__stock product-card__stock--${stockLevel}`}>
            <strong>{Product.stock}</strong>
            <span>en stock</span>
          </div>
        </div>

        <span className="product-card__date">{FormatDateTime(Product.editedAt || Product.createdAt)}</span>
      </div>

      <footer className="product-card__actions" onClick={StopActions}>
        <button type="button" className="product-card__action" onClick={() => OnEdit(Product)}>
          <IconEdit />
          <span>Editar</span>
        </button>
        <button
          type="button"
          className="product-card__action product-card__action--danger"
          onClick={() => OnDelete(Product)}
        >
          <IconTrash />
          <span>Eliminar</span>
        </button>
      </footer>
    </article>
  );
};
