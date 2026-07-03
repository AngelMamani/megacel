import type { Category } from '../../../../domain/entities/Category.ts';
import type { Brand } from '../../../../domain/entities/Brand.ts';

export type CategoryOption = Pick<Category, 'id' | 'name' | 'isActive' | 'color' | 'gradient'>;
export type BrandOption = Pick<Brand, 'id' | 'name' | 'isActive' | 'color' | 'gradient' | 'categoryIds'>;

export type ProductViewMode = 'table' | 'grid';
export type ProductSortKey = 'recent' | 'name' | 'price' | 'stock';

export interface ProductImageField {
  id: string;
  file: File | null;
  preview: string;
  url?: string;
}

export interface ProductSpecificationField {
  key: string;
  value: string;
  id: string;
}

export interface ProductVariantField {
  id: string;
  productId?: string;
  colorName: string;
  colorHex: string;
  price: number;
  costPrice: number;
  discount: number;
  stock: number;
  images: ProductImageField[];
}

export type ProductVariantFieldKey =
  | 'colorName'
  | 'colorHex'
  | 'stock'
  | 'price'
  | 'costPrice'
  | 'discount';

export interface ProductFormData {
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  costPrice: number;
  discount: number;
  discountPercentage: number;
  stock: number;
  minStock: number;
  status: 'activo' | 'inactivo';
  images: ProductImageField[];
  description: string;
  shortDescription: string;
  specifications: ProductSpecificationField[];
  notes: string;
  variants: ProductVariantField[];
}
