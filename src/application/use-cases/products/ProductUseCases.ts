import type { IProductRepository } from '../../../domain/repositories/IProductRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';
import type { CreateProductInput, CreateProductOutput } from '../../dto/products/CreateProductDto.ts';
import type { UpdateProductInput, UpdateProductOutput } from '../../dto/products/UpdateProductDto.ts';
import type { DeleteProductInput, DeleteProductOutput } from '../../dto/products/DeleteProductDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type ProductUseCaseDeps = {
  productRepository: IProductRepository;
  historyRepository: IHistoryRepository;
};

export function createCreateProductUseCase(
  deps: ProductUseCaseDeps
): UseCase<CreateProductInput, CreateProductOutput> {
  return {
    async execute(input) {
      await deps.productRepository.create({
        ...input.product,
        soldCount: input.product.soldCount ?? 0,
      });

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Create,
        section: HISTORY_SECTION.Products,
        itemName: input.product.name,
        itemId: input.product.id,
        details: `Producto "${input.product.name}" creado`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });

      return { product: input.product };
    },
  };
}

export function createUpdateProductUseCase(
  deps: ProductUseCaseDeps
): UseCase<UpdateProductInput, UpdateProductOutput> {
  return {
    async execute(input) {
      await deps.productRepository.update(input.productId, input.patch);

      const changes = deps.historyRepository.compareObjects(
        input.beforeSnapshot,
        input.afterSnapshot
      );

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Update,
        section: HISTORY_SECTION.Products,
        itemName: input.itemName,
        itemId: input.productId,
        details: `Producto "${input.itemName}" actualizado`,
        changes: changes.length > 0 ? changes : undefined,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });

      return { productId: input.productId };
    },
  };
}

export function createDeleteProductUseCase(
  deps: ProductUseCaseDeps
): UseCase<DeleteProductInput, DeleteProductOutput> {
  return {
    async execute(input) {
      await deps.productRepository.delete(input.productId);

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Delete,
        section: HISTORY_SECTION.Products,
        itemName: input.itemName,
        itemId: input.productId,
        details: `Producto "${input.itemName}" eliminado`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });

      return { productId: input.productId };
    },
  };
}
