import type { IAdminRepository } from '../../../domain/repositories/IAdminRepository.ts';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.ts';
import { adminIdFromEmail } from '../../../domain/services/AdminIdGenerator.ts';
import { assertValidEmail, normalizeEmail } from '../../../domain/value-objects/Email.ts';
import { createValidationError, throwApplicationError } from '../../errors/ApplicationError.ts';
import type { AddAdminInput, AddAdminOutput } from '../../dto/admins/AddAdminDto.ts';
import type { RemoveAdminInput, RemoveAdminOutput } from '../../dto/admins/RemoveAdminDto.ts';
import type {
  UpdateAdminProfileInput,
  UpdateAdminProfileOutput,
} from '../../dto/admins/UpdateAdminProfileDto.ts';
import type {
  UpdateAdminPreferencesInput,
  UpdateAdminPreferencesOutput,
} from '../../dto/admins/UpdateAdminPreferencesDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type AdminUseCaseDeps = {
  adminRepository: IAdminRepository;
};

export type UpdateAdminProfileDeps = {
  adminRepository: IAdminRepository;
  authRepository: IAuthRepository;
};

export function createAddAdminUseCase(
  deps: AdminUseCaseDeps
): UseCase<AddAdminInput, AddAdminOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);
      const name = input.name.trim();

      if (!email || !name) {
        throwApplicationError(createValidationError('Completa todos los campos'));
      }

      try {
        assertValidEmail(email);
      } catch {
        throwApplicationError(createValidationError('Email inválido'));
      }

      const admin = {
        id: adminIdFromEmail(email),
        email,
        name,
        createdAt: new Date().toISOString(),
        createdBy: input.createdBy,
        isPrimary: input.isPrimary ?? false,
      };

      await deps.adminRepository.add(admin);

      return { admin };
    },
  };
}

export function createRemoveAdminUseCase(
  deps: AdminUseCaseDeps
): UseCase<RemoveAdminInput, RemoveAdminOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);
      await deps.adminRepository.remove(email);
      return { email };
    },
  };
}

export function createInitializePrimaryAdminUseCase(
  deps: AdminUseCaseDeps
): UseCase<void, void> {
  return {
    async execute() {
      await deps.adminRepository.initializePrimaryAdmin();
    },
  };
}

export function createTogglePrimaryAdminUseCase(
  deps: AdminUseCaseDeps
): UseCase<RemoveAdminInput, RemoveAdminOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);
      await deps.adminRepository.togglePrimary(email);
      return { email };
    },
  };
}

export function createUpdateAdminProfileUseCase(
  deps: UpdateAdminProfileDeps
): UseCase<UpdateAdminProfileInput, UpdateAdminProfileOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);
      const name = input.name.trim();

      if (!name) {
        throwApplicationError(createValidationError('El nombre es requerido'));
      }

      if (!input.profile.documentNumber?.trim()) {
        throwApplicationError(createValidationError('El número de documento es requerido'));
      }

      await deps.adminRepository.update(email, {
        name,
        profile: {
          ...input.profile,
          documentNumber: input.profile.documentNumber.trim(),
        },
        updatedAt: new Date().toISOString(),
      });

      await deps.authRepository.updateDisplayName(name).catch(() => undefined);

      return { email };
    },
  };
}

export function createUpdateAdminPreferencesUseCase(
  deps: AdminUseCaseDeps
): UseCase<UpdateAdminPreferencesInput, UpdateAdminPreferencesOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);

      await deps.adminRepository.update(email, {
        preferences: input.preferences,
        updatedAt: new Date().toISOString(),
      });

      return { email };
    },
  };
}
