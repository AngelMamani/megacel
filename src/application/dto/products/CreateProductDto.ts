import type { Product } from '../../../domain/entities/Product.ts';

export interface CreateProductInput {
  product: Product;
  actorEmail?: string;
  actorName?: string;
}

export interface CreateProductOutput {
  product: Product;
}
