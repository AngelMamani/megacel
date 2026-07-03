import type { Category } from '../../../../domain/entities/Category.ts';

export interface CategoryProductPreview {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'activo' | 'inactivo';
}

export type CategoryView = Category & {
  products?: CategoryProductPreview[];
};

export type CategoryViewMode = 'table' | 'grid';

export type CategorySortKey = 'name' | 'products' | 'recent';

export interface CategoryFormData {
  name: string;
  description: string;
  image: File | string | null;
  imagePreview: string;
}
