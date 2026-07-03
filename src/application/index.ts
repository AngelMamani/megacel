import type { IAuthRepository } from '../domain/repositories/IAuthRepository.ts';
import type { IAdminRepository } from '../domain/repositories/IAdminRepository.ts';
import type { IProductRepository } from '../domain/repositories/IProductRepository.ts';
import type { IOrderRepository } from '../domain/repositories/IOrderRepository.ts';
import type { ICategoryRepository } from '../domain/repositories/ICategoryRepository.ts';
import type { IBrandRepository } from '../domain/repositories/IBrandRepository.ts';
import type { IPlatformUserRepository } from '../domain/repositories/IPlatformUserRepository.ts';
import type { IHistoryRepository } from '../domain/repositories/IHistoryRepository.ts';
import type { INotificationRepository } from '../domain/repositories/INotificationRepository.ts';
import type { IProductReviewRepository } from '../domain/repositories/IProductReviewRepository.ts';

import { createLoginWithEmailUseCase } from './use-cases/auth/LoginWithEmailUseCase.ts';
import { createLoginWithGoogleUseCase } from './use-cases/auth/LoginWithGoogleUseCase.ts';
import {
  createLoginUnifiedWithEmailUseCase,
  createLoginUnifiedWithGoogleUseCase,
  createResolveUnifiedSessionUseCase,
} from './use-cases/auth/UnifiedAuthUseCases.ts';
import { createLogoutUseCase } from './use-cases/auth/LogoutUseCase.ts';
import { createRegisterStoreSaleUseCase } from './use-cases/sales/RegisterStoreSaleUseCase.ts';
import {
  createCalculateSalesStatsUseCase,
  createFilterCompletedSalesUseCase,
} from './use-cases/sales/CalculateSalesStatsUseCase.ts';
import { createUpdateOrderStatusUseCase } from './use-cases/orders/UpdateOrderStatusUseCase.ts';
import { createDeleteOrderUseCase } from './use-cases/orders/DeleteOrderUseCase.ts';
import {
  createCreateProductUseCase,
  createUpdateProductUseCase,
  createDeleteProductUseCase,
} from './use-cases/products/ProductUseCases.ts';
import {
  createAddAdminUseCase,
  createRemoveAdminUseCase,
  createInitializePrimaryAdminUseCase,
  createTogglePrimaryAdminUseCase,
  createUpdateAdminProfileUseCase,
  createUpdateAdminPreferencesUseCase,
} from './use-cases/admins/AdminUseCases.ts';
import {
  createCreateCategoryUseCase,
  createUpdateCategoryUseCase,
  createDeleteCategoryUseCase,
  createCreateBrandUseCase,
  createUpdateBrandUseCase,
  createDeleteBrandUseCase,
  createCreatePlatformUserUseCase,
  createUpdatePlatformUserUseCase,
  createDeletePlatformUserUseCase,
} from './use-cases/catalog/CatalogUseCases.ts';
import { createLogHistoryUseCase } from './use-cases/history/LogHistoryUseCase.ts';
import { createMarkNotificationAsReadUseCase } from './use-cases/notifications/MarkNotificationAsReadUseCase.ts';
import {
  createLoginCustomerWithEmailUseCase,
  createLoginCustomerWithGoogleUseCase,
  createRegisterCustomerUseCase,
  createResolveCustomerSessionUseCase,
  createGetCustomerProfileUseCase,
  createUpdateCustomerProfileUseCase,
} from './use-cases/customer/CustomerUseCases.ts';
import { createPlaceOnlineOrderUseCase } from './use-cases/customer/PlaceOnlineOrderUseCase.ts';
import { createCreateProductReviewUseCase } from './use-cases/customer/CreateProductReviewUseCase.ts';

/** Contenedor de dependencias para inyectar repositorios en los casos de uso. */
export interface ApplicationDependencies {
  authRepository: IAuthRepository;
  adminRepository: IAdminRepository;
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
  categoryRepository: ICategoryRepository;
  brandRepository: IBrandRepository;
  platformUserRepository: IPlatformUserRepository;
  historyRepository: IHistoryRepository;
  notificationRepository: INotificationRepository;
  productReviewRepository: IProductReviewRepository;
}

/** Fábrica central — composition root de la capa Application. */
export function createApplication(deps: ApplicationDependencies) {
  return {
    auth: {
      loginWithEmail: createLoginUnifiedWithEmailUseCase(deps),
      loginWithGoogle: createLoginUnifiedWithGoogleUseCase(deps),
      resolveSession: createResolveUnifiedSessionUseCase(deps),
      logout: createLogoutUseCase(deps),
      loginWithEmailAdmin: createLoginWithEmailUseCase(deps),
      loginWithGoogleAdmin: createLoginWithGoogleUseCase(deps),
    },
    sales: {
      registerStoreSale: createRegisterStoreSaleUseCase(deps),
      calculateStats: createCalculateSalesStatsUseCase(),
      filterCompleted: createFilterCompletedSalesUseCase(),
    },
    orders: {
      updateStatus: createUpdateOrderStatusUseCase(deps),
      delete: createDeleteOrderUseCase(deps),
    },
    products: {
      create: createCreateProductUseCase(deps),
      update: createUpdateProductUseCase(deps),
      delete: createDeleteProductUseCase(deps),
    },
    admins: {
      add: createAddAdminUseCase(deps),
      remove: createRemoveAdminUseCase(deps),
      initializePrimary: createInitializePrimaryAdminUseCase(deps),
      togglePrimary: createTogglePrimaryAdminUseCase(deps),
      updateProfile: createUpdateAdminProfileUseCase(deps),
      updatePreferences: createUpdateAdminPreferencesUseCase(deps),
    },
    categories: {
      create: createCreateCategoryUseCase(deps),
      update: createUpdateCategoryUseCase(deps),
      delete: createDeleteCategoryUseCase(deps),
    },
    brands: {
      create: createCreateBrandUseCase(deps),
      update: createUpdateBrandUseCase(deps),
      delete: createDeleteBrandUseCase(deps),
    },
    platformUsers: {
      create: createCreatePlatformUserUseCase(deps),
      update: createUpdatePlatformUserUseCase(deps),
      delete: createDeletePlatformUserUseCase(deps),
    },
    history: {
      log: createLogHistoryUseCase(deps),
    },
    notifications: {
      markAsRead: createMarkNotificationAsReadUseCase(deps),
    },
    customer: {
      loginWithEmail: createLoginCustomerWithEmailUseCase(deps),
      loginWithGoogle: createLoginCustomerWithGoogleUseCase(deps),
      register: createRegisterCustomerUseCase(deps),
      resolveSession: createResolveCustomerSessionUseCase(deps),
      getProfile: createGetCustomerProfileUseCase(deps),
      updateProfile: createUpdateCustomerProfileUseCase(deps),
      placeOnlineOrder: createPlaceOnlineOrderUseCase(deps),
      createProductReview: createCreateProductReviewUseCase(deps),
    },
  };
}

export type Application = ReturnType<typeof createApplication>;

// Re-exports de fábricas individuales
export { createLoginWithEmailUseCase } from './use-cases/auth/LoginWithEmailUseCase.ts';
export { createLoginWithGoogleUseCase } from './use-cases/auth/LoginWithGoogleUseCase.ts';
export { createLogoutUseCase } from './use-cases/auth/LogoutUseCase.ts';
export { createRegisterStoreSaleUseCase } from './use-cases/sales/RegisterStoreSaleUseCase.ts';
export {
  createCalculateSalesStatsUseCase,
  createFilterCompletedSalesUseCase,
} from './use-cases/sales/CalculateSalesStatsUseCase.ts';
export { createUpdateOrderStatusUseCase } from './use-cases/orders/UpdateOrderStatusUseCase.ts';
export { createDeleteOrderUseCase } from './use-cases/orders/DeleteOrderUseCase.ts';
export {
  createCreateProductUseCase,
  createUpdateProductUseCase,
  createDeleteProductUseCase,
} from './use-cases/products/ProductUseCases.ts';
export {
  createAddAdminUseCase,
  createRemoveAdminUseCase,
  createInitializePrimaryAdminUseCase,
  createTogglePrimaryAdminUseCase,
  createUpdateAdminProfileUseCase,
  createUpdateAdminPreferencesUseCase,
} from './use-cases/admins/AdminUseCases.ts';
export {
  createCreateCategoryUseCase,
  createUpdateCategoryUseCase,
  createDeleteCategoryUseCase,
  createCreateBrandUseCase,
  createUpdateBrandUseCase,
  createDeleteBrandUseCase,
  createCreatePlatformUserUseCase,
  createUpdatePlatformUserUseCase,
  createDeletePlatformUserUseCase,
} from './use-cases/catalog/CatalogUseCases.ts';
export { createLogHistoryUseCase } from './use-cases/history/LogHistoryUseCase.ts';
export { createMarkNotificationAsReadUseCase } from './use-cases/notifications/MarkNotificationAsReadUseCase.ts';

export type { UseCase } from './types/UseCaseTypes.ts';
export { PRIMARY_ADMIN_EMAIL } from './config/AdminConfig.ts';
export {
  createValidationError,
  createOperationFailedError,
  isApplicationError,
} from './errors/ApplicationError.ts';
export type { ApplicationError } from './errors/ApplicationError.ts';
