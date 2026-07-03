import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { ProductStatus } from '../value-objects/ProductStatus.ts';

/** Producto tecnológico del catálogo (compartido entre tienda y panel admin). */
export interface Product {
  id: EntityId;
  sku: string;
  name: string;
  categoryId: EntityId;
  brandId: EntityId;
  price: number;
  costPrice?: number;
  discount?: number;
  discountPercentage?: number;
  finalPrice: number;
  stock: number;
  minStock?: number;
  status: ProductStatus;
  images?: string[];
  description?: string;
  shortDescription?: string;
  specifications?: Record<string, string>;
  notes?: string;
  /** Unidades vendidas acumuladas (Firebase increment). */
  soldCount?: number;
  createdAt?: Timestamp;
  editedAt?: Timestamp;
}
