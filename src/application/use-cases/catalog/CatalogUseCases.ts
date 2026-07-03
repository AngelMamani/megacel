import type { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository.ts';
import type { IBrandRepository } from '../../../domain/repositories/IBrandRepository.ts';
import type { IPlatformUserRepository } from '../../../domain/repositories/IPlatformUserRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
  CreateBrandInput,
  UpdateBrandInput,
  DeleteBrandInput,
  CreatePlatformUserInput,
  UpdatePlatformUserInput,
  DeletePlatformUserInput,
} from '../../dto/catalog/CatalogDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type CategoryUseCaseDeps = {
  categoryRepository: ICategoryRepository;
  historyRepository: IHistoryRepository;
};

export function createCreateCategoryUseCase(
  deps: CategoryUseCaseDeps
): UseCase<CreateCategoryInput, { categoryId: string }> {
  return {
    async execute(input) {
      await deps.categoryRepository.create(input.category);
      await deps.historyRepository.log({
        action: HISTORY_ACTION.Create,
        section: HISTORY_SECTION.Categories,
        itemName: input.category.name,
        itemId: input.category.id,
        details: `Categoría "${input.category.name}" creada`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });
      return { categoryId: input.category.id };
    },
  };
}

export function createUpdateCategoryUseCase(
  deps: CategoryUseCaseDeps
): UseCase<UpdateCategoryInput, { categoryId: string }> {
  return {
    async execute(input) {
      await deps.categoryRepository.update(input.categoryId, input.patch);
      const changes = deps.historyRepository.compareObjects(
        input.beforeSnapshot,
        input.afterSnapshot
      );
      await deps.historyRepository.log({
        action: HISTORY_ACTION.Update,
        section: HISTORY_SECTION.Categories,
        itemName: input.itemName,
        itemId: input.categoryId,
        details: `Categoría "${input.itemName}" actualizada`,
        changes: changes.length > 0 ? changes : undefined,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });
      return { categoryId: input.categoryId };
    },
  };
}

export function createDeleteCategoryUseCase(
  deps: CategoryUseCaseDeps
): UseCase<DeleteCategoryInput, { categoryId: string }> {
  return {
    async execute(input) {
      await deps.categoryRepository.delete(input.categoryId);
      await deps.historyRepository.log({
        action: HISTORY_ACTION.Delete,
        section: HISTORY_SECTION.Categories,
        itemName: input.itemName,
        itemId: input.categoryId,
        details: `Categoría "${input.itemName}" eliminada`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });
      return { categoryId: input.categoryId };
    },
  };
}

export type BrandUseCaseDeps = {
  brandRepository: IBrandRepository;
  historyRepository: IHistoryRepository;
};

export function createCreateBrandUseCase(
  deps: BrandUseCaseDeps
): UseCase<CreateBrandInput, { brandId: string }> {
  return {
    async execute(input) {
      await deps.brandRepository.create(input.brand);
      await deps.historyRepository.log({
        action: HISTORY_ACTION.Create,
        section: HISTORY_SECTION.Brands,
        itemName: input.brand.name,
        itemId: input.brand.id,
        details: `Marca "${input.brand.name}" creada`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });
      return { brandId: input.brand.id };
    },
  };
}

export function createUpdateBrandUseCase(
  deps: BrandUseCaseDeps
): UseCase<UpdateBrandInput, { brandId: string }> {
  return {
    async execute(input) {
      await deps.brandRepository.update(input.brandId, input.patch);
      const changes = deps.historyRepository.compareObjects(
        input.beforeSnapshot,
        input.afterSnapshot
      );
      await deps.historyRepository.log({
        action: HISTORY_ACTION.Update,
        section: HISTORY_SECTION.Brands,
        itemName: input.itemName,
        itemId: input.brandId,
        details: `Marca "${input.itemName}" actualizada`,
        changes: changes.length > 0 ? changes : undefined,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });
      return { brandId: input.brandId };
    },
  };
}

export function createDeleteBrandUseCase(
  deps: BrandUseCaseDeps
): UseCase<DeleteBrandInput, { brandId: string }> {
  return {
    async execute(input) {
      await deps.brandRepository.delete(input.brandId);
      await deps.historyRepository.log({
        action: HISTORY_ACTION.Delete,
        section: HISTORY_SECTION.Brands,
        itemName: input.itemName,
        itemId: input.brandId,
        details: `Marca "${input.itemName}" eliminada`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });
      return { brandId: input.brandId };
    },
  };
}

export type PlatformUserUseCaseDeps = {
  authRepository: IAuthRepository;
  platformUserRepository: IPlatformUserRepository;
  historyRepository: IHistoryRepository;
};

export function createCreatePlatformUserUseCase(
  deps: PlatformUserUseCaseDeps
): UseCase<CreatePlatformUserInput, { userId: string }> {
  return {
    async execute(input) {
      const password = input.password.trim();
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      const existing = await deps.platformUserRepository.getByEmail(input.user.email);
      if (existing) {
        throw new Error('Este correo ya está registrado.');
      }

      const authSession = await deps.authRepository.createUserWithEmail(
        input.user.email,
        password,
        input.user.name
      );

      const userToCreate = {
        ...input.user,
        authUid: authSession.id,
      };

      await deps.platformUserRepository.create(userToCreate);
      void deps.historyRepository
        .log({
          action: HISTORY_ACTION.Create,
          section: HISTORY_SECTION.Users,
          itemName: input.user.name,
          itemId: input.user.id,
          details: `Usuario "${input.user.name}" creado`,
          actorEmail: input.actorEmail,
          actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
        })
        .catch(() => undefined);
      return { userId: input.user.id };
    },
  };
}

export function createUpdatePlatformUserUseCase(
  deps: PlatformUserUseCaseDeps
): UseCase<UpdatePlatformUserInput, { userId: string }> {
  return {
    async execute(input) {
      await deps.platformUserRepository.update(input.userId, input.patch);
      const changes = deps.historyRepository.compareObjects(
        input.beforeSnapshot,
        input.afterSnapshot
      );
      void deps.historyRepository
        .log({
          action: HISTORY_ACTION.Update,
          section: HISTORY_SECTION.Users,
          itemName: input.itemName,
          itemId: input.userId,
          details: `Usuario "${input.itemName}" actualizado`,
          changes: changes.length > 0 ? changes : undefined,
          actorEmail: input.actorEmail,
          actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
        })
        .catch(() => undefined);
      return { userId: input.userId };
    },
  };
}

export function createDeletePlatformUserUseCase(
  deps: PlatformUserUseCaseDeps
): UseCase<DeletePlatformUserInput, { userId: string }> {
  return {
    async execute(input) {
      await deps.platformUserRepository.delete(input.userId);
      void deps.historyRepository
        .log({
          action: HISTORY_ACTION.Delete,
          section: HISTORY_SECTION.Users,
          itemName: input.itemName,
          itemId: input.userId,
          details: `Usuario "${input.itemName}" eliminado`,
          actorEmail: input.actorEmail,
          actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
        })
        .catch(() => undefined);
      return { userId: input.userId };
    },
  };
}
