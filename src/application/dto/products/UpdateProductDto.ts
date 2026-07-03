import type { Product } from '../../../domain/entities/Product.ts';

export interface UpdateProductInput {
  productId: string;
  patch: Partial<Product>;
  itemName: string;
  beforeSnapshot: Record<string, unknown>;
  afterSnapshot: Record<string, unknown>;
  actorEmail?: string;
  actorName?: string;
}

export interface UpdateProductOutput {
  productId: string;
}
