import { createApplication, type Application } from '../application/index.ts';
import { createFirebaseAuthRepository } from './firebase/repositories/FirebaseAuthRepository.ts';
import { createFirestoreAdminRepository } from './firebase/repositories/FirestoreAdminRepository.ts';
import { createFirestoreProductRepository } from './firebase/repositories/FirestoreProductRepository.ts';
import { createFirestoreCategoryRepository } from './firebase/repositories/FirestoreCategoryRepository.ts';
import { createFirestoreBrandRepository } from './firebase/repositories/FirestoreBrandRepository.ts';
import { createFirestoreOrderRepository } from './firebase/repositories/FirestoreOrderRepository.ts';
import { createFirestorePlatformUserRepository } from './firebase/repositories/FirestorePlatformUserRepository.ts';
import {
  createFirestoreHistoryRepository,
  migrateLegacyLocalHistory,
} from './firebase/repositories/FirestoreHistoryRepository.ts';
import { createFirestoreNotificationRepository } from './firebase/repositories/FirestoreNotificationRepository.ts';
import { createFirestoreProductReviewRepository } from './firebase/repositories/FirestoreProductReviewRepository.ts';
import { seedFirestoreIfEmpty } from './firebase/seed/SeedService.ts';

import type { IAuthRepository } from '../domain/repositories/IAuthRepository.ts';
import type { IAdminRepository } from '../domain/repositories/IAdminRepository.ts';
import type { IProductRepository } from '../domain/repositories/IProductRepository.ts';
import type { ICategoryRepository } from '../domain/repositories/ICategoryRepository.ts';
import type { IBrandRepository } from '../domain/repositories/IBrandRepository.ts';
import type { IOrderRepository } from '../domain/repositories/IOrderRepository.ts';
import type { IPlatformUserRepository } from '../domain/repositories/IPlatformUserRepository.ts';
import type { IHistoryRepository } from '../domain/repositories/IHistoryRepository.ts';
import type { INotificationRepository } from '../domain/repositories/INotificationRepository.ts';
import type { IProductReviewRepository } from '../domain/repositories/IProductReviewRepository.ts';

export interface InfrastructureRepositories {
  auth: IAuthRepository;
  admin: IAdminRepository;
  product: IProductRepository;
  category: ICategoryRepository;
  brand: IBrandRepository;
  order: IOrderRepository;
  platformUser: IPlatformUserRepository;
  history: IHistoryRepository;
  notification: INotificationRepository;
  productReview: IProductReviewRepository;
}

export interface Infrastructure {
  repositories: InfrastructureRepositories;
  application: Application;
  seedFirestoreIfEmpty: typeof seedFirestoreIfEmpty;
  migrateLegacyLocalHistory: typeof migrateLegacyLocalHistory;
}

export function createInfrastructure(): Infrastructure {
  const repositories: InfrastructureRepositories = {
    auth: createFirebaseAuthRepository(),
    admin: createFirestoreAdminRepository(),
    product: createFirestoreProductRepository(),
    category: createFirestoreCategoryRepository(),
    brand: createFirestoreBrandRepository(),
    order: createFirestoreOrderRepository(),
    platformUser: createFirestorePlatformUserRepository(),
    history: createFirestoreHistoryRepository(),
    notification: createFirestoreNotificationRepository(),
    productReview: createFirestoreProductReviewRepository(),
  };

  const application = createApplication({
    authRepository: repositories.auth,
    adminRepository: repositories.admin,
    productRepository: repositories.product,
    categoryRepository: repositories.category,
    brandRepository: repositories.brand,
    orderRepository: repositories.order,
    platformUserRepository: repositories.platformUser,
    historyRepository: repositories.history,
    notificationRepository: repositories.notification,
    productReviewRepository: repositories.productReview,
  });

  return {
    repositories,
    application,
    seedFirestoreIfEmpty,
    migrateLegacyLocalHistory,
  };
}

let infrastructureInstance: Infrastructure | null = null;

export function getInfrastructure(): Infrastructure {
  if (!infrastructureInstance) {
    infrastructureInstance = createInfrastructure();
  }
  return infrastructureInstance;
}

export {
  firebaseApp,
  firebaseAuth,
  firestoreDb,
  firebaseStorage,
  firebaseConfig,
} from './firebase/config/FirebaseConfig.ts';
export { COLLECTIONS } from './firebase/config/Collections.ts';
export {
  subscribeCollection,
  getDocById,
  setDocById,
  updateDocById,
  deleteDocById,
  isCollectionEmpty,
} from './firebase/helpers/FirestoreHelpers.ts';
export { compareHistoryObjects } from './firebase/helpers/HistoryCompareHelpers.ts';
export {
  historyService,
  compareObjects,
} from './compatibility/HistoryServiceAdapter.ts';
export {
  adminIdFromEmail,
  initializePrimaryAdmin,
  isAdminEmail,
  isPrimaryAdmin,
  getAdminByEmail,
  getAllAdmins,
  addAdmin,
  removeAdmin,
  togglePrimaryAdmin,
} from './compatibility/AdminHelpersAdapter.ts';
export {
  uploadProductImage,
  uploadAdminAvatar,
  uploadBrandImage,
  uploadCategoryImage,
  uploadProductReviewImage,
  deleteProductImage,
  deleteProductFolder,
  deleteBrandFolder,
  deleteBrandStorageAssets,
  deleteCategoryFolder,
  deleteCategoryStorageAssets,
} from './firebase/storage/FirebaseStorageService.ts';
