import type { IProductRepository } from '../../../domain/repositories/IProductRepository.ts';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.ts';
import type { IProductReviewRepository } from '../../../domain/repositories/IProductReviewRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { ProductReview } from '../../../domain/entities/ProductReview.ts';
import { createEntityNotFoundError } from '../../../domain/errors/EntityNotFoundError.ts';
import { isCompletedOrder } from '../../../domain/value-objects/OrderStatus.ts';
import { REVIEW_STATUS } from '../../../domain/value-objects/ReviewStatus.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';
import {
  validateReviewBody,
  validateReviewImages,
  validateReviewRating,
} from '../../../domain/services/ProductReviewPolicy.ts';
import { createValidationError, throwApplicationError } from '../../errors/ApplicationError.ts';
import type {
  CreateProductReviewInput,
  CreateProductReviewOutput,
} from '../../dto/customer/ProductReviewDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type CreateProductReviewDeps = {
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
  productReviewRepository: IProductReviewRepository;
  historyRepository: IHistoryRepository;
};

const BuildReviewId = () =>
  `review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const ResolveProductImage = (images?: string[]) => images?.find(Boolean) ?? '';

async function ResolveVerifiedPurchase(
  deps: CreateProductReviewDeps,
  input: CreateProductReviewInput
) {
  if (!input.orderId) return false;

  const order = await deps.orderRepository.getById(input.orderId);
  if (!order) return false;
  if (order.platformUserId !== input.platformUserId) return false;
  if (!isCompletedOrder(order.status)) return false;

  return order.orderItems?.some((item) => item.id === input.productId) ?? false;
}

export function createCreateProductReviewUseCase(
  deps: CreateProductReviewDeps
): UseCase<CreateProductReviewInput, CreateProductReviewOutput> {
  return {
    async execute(input) {
      const ratingError = validateReviewRating(input.rating);
      if (ratingError) {
        throwApplicationError(createValidationError(ratingError));
      }

      const bodyError = validateReviewBody(input.body);
      if (bodyError) {
        throwApplicationError(createValidationError(bodyError));
      }

      const imagesError = validateReviewImages(input.images);
      if (imagesError) {
        throwApplicationError(createValidationError(imagesError));
      }

      if (!input.authorName.trim()) {
        throwApplicationError(createValidationError('Ingresa tu nombre para publicar la valoración'));
      }

      const product = await deps.productRepository.getById(input.productId);
      if (!product) {
        const error = createEntityNotFoundError('Producto', input.productId);
        throw new Error(error.message);
      }

      const now = new Date().toISOString();
      const isVerified = await ResolveVerifiedPurchase(deps, input);

      const review: ProductReview = {
        id: BuildReviewId(),
        productId: product.id,
        productName: product.name,
        productImage: ResolveProductImage(product.images),
        authorName: input.authorName.trim(),
        platformUserId: input.platformUserId,
        orderId: input.orderId,
        rating: Math.round(input.rating),
        body: input.body.trim(),
        images: input.images?.filter(Boolean),
        publishedAt: now,
        isVerified,
        status: REVIEW_STATUS.Published,
        createdAt: now,
        updatedAt: now,
      };

      await deps.productReviewRepository.create(review);

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Create,
        section: HISTORY_SECTION.Products,
        actorType: HISTORY_ACTOR_TYPE.Client,
        itemName: product.name,
        itemId: review.id,
        details: `Valoración ${review.rating}★ en "${product.name}" por ${input.authorName.trim()}`,
        actorName: input.authorName.trim(),
      });

      return { review };
    },
  };
}
