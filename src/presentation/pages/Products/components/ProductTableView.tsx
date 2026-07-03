import type { CSSProperties, MouseEvent } from 'react';
import type { Product } from '../../../../domain/entities/Product.ts';
import type { BrandOption, CategoryOption } from '../types/ProductPageTypes.ts';
import { FormatDateTime, GetStockLevel } from '../utils/productPresentationUtils.ts';
import { IconEdit, IconPackage, IconTrash } from './ProductIcons.tsx';

interface ProductTableViewProps {
  Products: Product[];
  PendingProductIds: Set<string>;
  SelectedProductId: string | null;
  GetCategoryById: (id: string) => CategoryOption | undefined;
  GetBrandById: (id: string) => BrandOption | undefined;
  FormatCurrency: (amount: number) => string;
  CalculateDiscountPercentage: (price: number, discount: number) => number;
  OnSelect: (product: Product) => void;
  OnEdit: (product: Product) => void;
  OnDelete: (product: Product) => void;
  HasFilters: boolean;
}

export const ProductTableView = ({
  Products,
  PendingProductIds,
  SelectedProductId,
  GetCategoryById,
  GetBrandById,
  FormatCurrency,
  CalculateDiscountPercentage,
  OnSelect,
  OnEdit,
  OnDelete,
  HasFilters,
}: ProductTableViewProps) => {
  const HandleRowClick = (product: Product) => {
    if (PendingProductIds.has(product.id)) return;
    OnSelect(product);
    OnEdit(product);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="products-table-shell">
      <table className="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Fecha</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {Products.length > 0 ? (
            Products.map((product, index) => {
              const category = GetCategoryById(product.categoryId);
              const brand = GetBrandById(product.brandId);
              const finalPrice = product.finalPrice || product.price;
              const hasDiscount =
                product.discount && product.discount > 0 && finalPrice < product.price;
              const stockLevel = GetStockLevel(product.stock, product.minStock);

              return (
                <tr
                  key={product.id}
                  className={[
                    PendingProductIds.has(product.id) ? 'products-table__row--pending' : '',
                    SelectedProductId === product.id ? 'products-table__row--selected' : '',
                    'products-table__row--interactive',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ '--row-delay': `${Math.min(index * 40, 320)}ms` } as CSSProperties}
                  onClick={() => HandleRowClick(product)}
                  tabIndex={PendingProductIds.has(product.id) ? -1 : 0}
                  onKeyDown={(e) => {
                    if (PendingProductIds.has(product.id)) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      HandleRowClick(product);
                    }
                  }}
                  role="button"
                  aria-label={`Editar producto ${product.name}`}
                >
                  <td>
                    <div className="products-table__product">
                      <div className="products-table__thumb">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="products-table__thumb-img" />
                        ) : (
                          <span
                            className="products-table__thumb-fallback"
                            style={{ background: category?.gradient }}
                          >
                            {product.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <strong>{product.name}</strong>
                        <span className="products-table__sku">SKU: {product.sku}</span>
                        {PendingProductIds.has(product.id) && (
                          <span className="products-table__pending">Sincronizando...</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="products-table__pill" style={{ '--tag-color': category?.color } as CSSProperties}>
                      {category?.name || 'Sin categoría'}
                    </span>
                  </td>
                  <td>
                    <span className="products-table__pill" style={{ '--tag-color': brand?.color } as CSSProperties}>
                      {brand?.name || 'Sin marca'}
                    </span>
                  </td>
                  <td>
                    <div className="products-table__price">
                      {hasDiscount ? (
                        <>
                          <strong>{FormatCurrency(finalPrice)}</strong>
                          <span className="products-table__price-old">{FormatCurrency(product.price)}</span>
                          <span className="products-table__discount">
                            -
                            {product.discountPercentage?.toFixed(0) ||
                              CalculateDiscountPercentage(product.price, product.discount || 0).toFixed(0)}
                            %
                          </span>
                        </>
                      ) : (
                        <strong>{FormatCurrency(finalPrice)}</strong>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`products-table__stock products-table__stock--${stockLevel}`}>
                      {product.stock.toLocaleString('es-PE')}
                    </span>
                  </td>
                  <td>
                    <time className="products-table__date">
                      {FormatDateTime(product.editedAt || product.createdAt)}
                    </time>
                  </td>
                  <td>
                    <div className="products-table__actions" onClick={StopActions}>
                      <button type="button" className="products-table__action" onClick={() => OnEdit(product)} title="Editar">
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className="products-table__action products-table__action--danger"
                        onClick={() => OnDelete(product)}
                        title="Eliminar"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7}>
                <div className="products-empty">
                  <IconPackage size={36} />
                  <h3>Sin resultados</h3>
                  <p>
                    {HasFilters
                      ? 'No hay productos activos que coincidan con los filtros.'
                      : 'Aún no hay productos activos. Crea el primero desde el botón superior.'}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
