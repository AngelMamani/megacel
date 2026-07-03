export const PRODUCT_STATUS = {
  Active: 'activo',
  Inactive: 'inactivo',
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export function isProductStatus(value: string): value is ProductStatus {
  return Object.values(PRODUCT_STATUS).includes(value as ProductStatus);
}

export function isProductAvailable(status: ProductStatus, stock: number): boolean {
  return status === PRODUCT_STATUS.Active && stock > 0;
}
