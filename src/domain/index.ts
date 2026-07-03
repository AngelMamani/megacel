// Entidades
export type { Product } from './entities/Product.ts';
export type { Category } from './entities/Category.ts';
export type { Brand } from './entities/Brand.ts';
export type { Order } from './entities/Order.ts';
export type { OrderItem } from './entities/OrderItem.ts';
export type { PlatformUser } from './entities/PlatformUser.ts';
export type { Admin, AdminProfile, AdminPreferences } from './entities/Admin.ts';
export type { HistoryEntry } from './entities/HistoryEntry.ts';
export type { HistoryChange } from './entities/HistoryChange.ts';
export type { Notification } from './entities/Notification.ts';
export type { ProductReview } from './entities/ProductReview.ts';

// Tipos comunes
export type { EntityId, Unsubscribe, Timestamp } from './types/CommonTypes.ts';

// Value Objects
export {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  isOrderStatus,
  isCompletedOrder,
  isPaymentSuccessfulOrder,
  isRejectedOrder,
  isVerifyingPaymentOrder,
  isInProgressOrder,
  getOrderStatusLabel,
  getOrderStatusColor,
  matchesOrderStatusFilter,
  normalizeToWritableOrderStatus,
} from './value-objects/OrderStatus.ts';
export type { OrderStatus, LegacyOrderStatus, StoredOrderStatus } from './value-objects/OrderStatus.ts';

export { PRODUCT_STATUS, isProductStatus, isProductAvailable } from './value-objects/ProductStatus.ts';
export type { ProductStatus } from './value-objects/ProductStatus.ts';

export { SALE_SOURCE, isSaleSource } from './value-objects/SaleSource.ts';
export type { SaleSource } from './value-objects/SaleSource.ts';

export { PLATFORM_USER_ROLE, isPlatformUserRole } from './value-objects/PlatformUserRole.ts';
export type { PlatformUserRole } from './value-objects/PlatformUserRole.ts';

export { PLATFORM_USER_STATUS, isPlatformUserStatus } from './value-objects/PlatformUserStatus.ts';
export type { PlatformUserStatus } from './value-objects/PlatformUserStatus.ts';

export { DOCUMENT_TYPE, isDocumentType } from './value-objects/DocumentType.ts';
export type { DocumentType } from './value-objects/DocumentType.ts';

export { TREND_DIRECTION, isTrendDirection } from './value-objects/TrendDirection.ts';
export type { TrendDirection } from './value-objects/TrendDirection.ts';

export { HISTORY_ACTION } from './value-objects/HistoryAction.ts';
export type { HistoryAction } from './value-objects/HistoryAction.ts';

export { HISTORY_SECTION } from './value-objects/HistorySection.ts';
export type { HistorySection } from './value-objects/HistorySection.ts';

export { NOTIFICATION_TYPE } from './value-objects/NotificationType.ts';
export type { NotificationType } from './value-objects/NotificationType.ts';

export { PAYMENT_METHOD, isPaymentMethod } from './value-objects/PaymentMethod.ts';
export type { PaymentMethod } from './value-objects/PaymentMethod.ts';

export { REVIEW_STATUS, isReviewStatus, isPublishedReviewStatus } from './value-objects/ReviewStatus.ts';
export type { ReviewStatus } from './value-objects/ReviewStatus.ts';

export { normalizeEmail, isValidEmail, assertValidEmail } from './value-objects/Email.ts';
export { formatMoney, calculateFinalPrice, calculateDiscountAmount, CURRENCY, LOCALE } from './value-objects/Money.ts';
export { hasEnoughStock, validateStockForSale, isLowStock, isValidStockValue } from './value-objects/Stock.ts';

// Repositorios (contratos / ports)
export type { IProductRepository } from './repositories/IProductRepository.ts';
export type { ICategoryRepository } from './repositories/ICategoryRepository.ts';
export type { IBrandRepository } from './repositories/IBrandRepository.ts';
export type { IOrderRepository } from './repositories/IOrderRepository.ts';
export type { IPlatformUserRepository } from './repositories/IPlatformUserRepository.ts';
export type { IAdminRepository } from './repositories/IAdminRepository.ts';
export type { IHistoryRepository, LogHistoryParams } from './repositories/IHistoryRepository.ts';
export type { INotificationRepository } from './repositories/INotificationRepository.ts';
export type { IAuthRepository, AuthSession } from './repositories/IAuthRepository.ts';
export type { IProductReviewRepository } from './repositories/IProductReviewRepository.ts';

// Servicios de dominio
export {
  buildNextOrderNumber,
  buildSaleId,
  formatOrderNumber,
  getCompletedOrders,
  filterOrdersBySource,
  calculateTotalRevenue,
  countSalesBySource,
} from './services/OrderNumberGenerator.ts';
export { adminIdFromEmail } from './services/AdminIdGenerator.ts';
export {
  MIN_REVIEW_BODY_LENGTH,
  MAX_REVIEW_BODY_LENGTH,
  validateReviewRating,
  validateReviewBody,
  isVisibleProductReview,
  sortProductReviewsForDisplay,
  buildProductReviewSummary,
} from './services/ProductReviewPolicy.ts';

// Errores de dominio
export { DOMAIN_ERROR_CODE, isDomainError } from './errors/DomainError.ts';
export type { DomainError, DomainErrorCode } from './errors/DomainError.ts';
export { createInsufficientStockError } from './errors/InsufficientStockError.ts';
export { createInvalidStockError } from './errors/InvalidStockError.ts';
export { createUnauthorizedAccessError } from './errors/UnauthorizedAccessError.ts';
export { createEntityNotFoundError } from './errors/EntityNotFoundError.ts';
export { createDuplicateEntityError } from './errors/DuplicateEntityError.ts';
