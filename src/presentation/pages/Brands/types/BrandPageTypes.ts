import type { Brand } from '../../../../domain/entities/Brand.ts';
import type { Category } from '../../../../domain/entities/Category.ts';

export interface BrandProductPreview {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'activo' | 'inactivo';
}

export type BrandView = Brand & {
  products?: BrandProductPreview[];
};

export type CategoryOption = Pick<Category, 'id' | 'name' | 'isActive'>;

export type BrandViewMode = 'table' | 'grid';

export type BrandSortKey = 'name' | 'products' | 'recent';

export interface BrandFormData {
  name: string;
  description: string;
  categoryIds: string[];
  image: File | string | null;
  imagePreview: string;
  imageFit: 'cover' | 'contain';
}
