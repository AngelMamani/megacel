import type { Product } from '../entities/Product.ts';

export const RELATED_PRODUCTS_LIMIT = 8;

const CompareRelatedProducts = (left: Product, right: Product) => {
  const soldA = left.soldCount ?? 0;
  const soldB = right.soldCount ?? 0;
  if (soldA !== soldB) return soldB - soldA;

  return left.name.localeCompare(right.name, 'es');
};

/** Productos de la misma categoría, excluyendo el actual. */
export const PickRelatedProducts = (
  currentProduct: Product,
  catalog: Product[],
  limit = RELATED_PRODUCTS_LIMIT
) =>
  catalog
    .filter(
      (item) =>
        item.id !== currentProduct.id &&
        item.status === 'activo' &&
        item.categoryId === currentProduct.categoryId
    )
    .sort(CompareRelatedProducts)
    .slice(0, limit);
