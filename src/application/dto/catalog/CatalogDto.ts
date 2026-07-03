import type { Category } from '../../../domain/entities/Category.ts';
import type { Brand } from '../../../domain/entities/Brand.ts';
import type { PlatformUser } from '../../../domain/entities/PlatformUser.ts';

export interface CreateCategoryInput {
  category: Category;
  actorEmail?: string;
  actorName?: string;
}

export interface UpdateCategoryInput {
  categoryId: string;
  patch: Partial<Category>;
  itemName: string;
  beforeSnapshot: Record<string, unknown>;
  afterSnapshot: Record<string, unknown>;
  actorEmail?: string;
  actorName?: string;
}

export interface DeleteCategoryInput {
  categoryId: string;
  itemName: string;
  actorEmail?: string;
  actorName?: string;
}

export interface CreateBrandInput {
  brand: Brand;
  actorEmail?: string;
  actorName?: string;
}

export interface UpdateBrandInput {
  brandId: string;
  patch: Partial<Brand>;
  itemName: string;
  beforeSnapshot: Record<string, unknown>;
  afterSnapshot: Record<string, unknown>;
  actorEmail?: string;
  actorName?: string;
}

export interface DeleteBrandInput {
  brandId: string;
  itemName: string;
  actorEmail?: string;
  actorName?: string;
}

export interface CreatePlatformUserInput {
  user: PlatformUser;
  password: string;
  actorEmail?: string;
  actorName?: string;
}

export interface UpdatePlatformUserInput {
  userId: string;
  patch: Partial<PlatformUser>;
  itemName: string;
  beforeSnapshot: Record<string, unknown>;
  afterSnapshot: Record<string, unknown>;
  actorEmail?: string;
  actorName?: string;
}

export interface DeletePlatformUserInput {
  userId: string;
  itemName: string;
  actorEmail?: string;
  actorName?: string;
}
