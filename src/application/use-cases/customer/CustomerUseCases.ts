import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { IPlatformUserRepository } from '../../../domain/repositories/IPlatformUserRepository.ts';
import type { PlatformUser } from '../../../domain/entities/PlatformUser.ts';
import { normalizeEmail } from '../../../domain/value-objects/Email.ts';
import { PLATFORM_USER_ROLE } from '../../../domain/value-objects/PlatformUserRole.ts';
import { PLATFORM_USER_STATUS } from '../../../domain/value-objects/PlatformUserStatus.ts';
import {
  CreateCustomerAccessError,
  IsActiveCustomer,
} from '../../../domain/services/CustomerAccessPolicy.ts';
import type {
  CustomerSessionOutput,
  LoginCustomerWithEmailInput,
  RegisterCustomerInput,
  UpdateCustomerProfileInput,
} from '../../dto/customer/CustomerAuthDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';
import { LogLoginHistory, LogLoginFailedAttempt, GetAuthErrorMessage } from '../history/LogLoginHistoryHelper.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';

export type CustomerUseCaseDeps = {
  authRepository: IAuthRepository;
  platformUserRepository: IPlatformUserRepository;
  historyRepository: IHistoryRepository;
};

const GenerateCustomerCode = (): string =>
  `CLI-${Date.now().toString(36).toUpperCase().slice(-6)}`;

const MapCustomerSession = (platformUser: PlatformUser, authUid: string): CustomerSessionOutput => ({
  authUid,
  platformUserId: platformUser.id,
  code: platformUser.code,
  name: platformUser.name,
  email: platformUser.email,
  role: 'cliente',
});

async function ResolvePlatformCustomer(
  deps: CustomerUseCaseDeps,
  authUid: string,
  email: string
): Promise<PlatformUser | null> {
  const normalizedEmail = normalizeEmail(email);
  const byUid = await deps.platformUserRepository.getByAuthUid(authUid);
  if (IsActiveCustomer(byUid)) return byUid;

  const byEmail = await deps.platformUserRepository.getByEmail(normalizedEmail);
  if (IsActiveCustomer(byEmail)) return byEmail;

  return null;
}

async function SyncCustomerLink(
  deps: CustomerUseCaseDeps,
  platformUser: PlatformUser,
  authUid: string,
  sessionName: string
): Promise<PlatformUser> {
  const now = new Date().toISOString();
  const patch: Partial<PlatformUser> = {
    lastLogin: now,
    authUid,
  };

  if (!platformUser.name.trim() && sessionName.trim()) {
    patch.name = sessionName.trim();
  }

  if (platformUser.authUid !== authUid || patch.name) {
    await deps.platformUserRepository.update(platformUser.id, patch);
    return { ...platformUser, ...patch };
  }

  await deps.platformUserRepository.update(platformUser.id, { lastLogin: now });
  return { ...platformUser, lastLogin: now };
}

async function FinalizeCustomerSession(
  deps: CustomerUseCaseDeps,
  authUid: string,
  email: string,
  name: string
): Promise<CustomerSessionOutput> {
  const platformUser = await ResolvePlatformCustomer(deps, authUid, email);
  if (!platformUser) {
    await deps.authRepository.logout();
    throw CreateCustomerAccessError(email);
  }

  const synced = await SyncCustomerLink(deps, platformUser, authUid, name);
  return MapCustomerSession(synced, authUid);
}

export function createLoginCustomerWithEmailUseCase(
  deps: CustomerUseCaseDeps
): UseCase<LoginCustomerWithEmailInput, CustomerSessionOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);

      let session;
      try {
        session = await deps.authRepository.loginWithEmail(email, input.password);
      } catch (error) {
        await LogLoginFailedAttempt({
          historyRepository: deps.historyRepository,
          role: 'client',
          email,
          method: 'email',
          reason: GetAuthErrorMessage(error),
        });
        throw error;
      }

      try {
        const result = await FinalizeCustomerSession(deps, session.id, session.email, session.name);
        await LogLoginHistory({
          historyRepository: deps.historyRepository,
          role: 'client',
          email: session.email,
          name: session.name,
          sessionId: session.id,
          method: 'email',
        });
        return result;
      } catch (error) {
        await LogLoginFailedAttempt({
          historyRepository: deps.historyRepository,
          role: 'client',
          email: session.email,
          name: session.name,
          sessionId: session.id,
          method: 'email',
          reason: GetAuthErrorMessage(error),
        });
        throw error;
      }
    },
  };
}

export function createLoginCustomerWithGoogleUseCase(
  deps: CustomerUseCaseDeps
): UseCase<void, CustomerSessionOutput> {
  return {
    async execute() {
      let session;
      try {
        session = await deps.authRepository.loginWithGoogle();
      } catch (error) {
        await LogLoginFailedAttempt({
          historyRepository: deps.historyRepository,
          role: 'client',
          method: 'google',
          reason: GetAuthErrorMessage(error),
        });
        throw error;
      }

      const email = normalizeEmail(session.email);

      let platformUser = await ResolvePlatformCustomer(deps, session.id, email);

      if (!platformUser) {
        const now = new Date().toISOString();
        const newUser: PlatformUser = {
          id: `cli-${session.id}`,
          code: GenerateCustomerCode(),
          name: session.name.trim() || 'Cliente MEGA CEL',
          email,
          role: PLATFORM_USER_ROLE.Customer,
          status: PLATFORM_USER_STATUS.Active,
          authUid: session.id,
          createdAt: now,
          lastLogin: now,
        };
        await deps.platformUserRepository.create(newUser);
        platformUser = newUser;
      }

      if (!IsActiveCustomer(platformUser)) {
        await LogLoginFailedAttempt({
          historyRepository: deps.historyRepository,
          role: 'client',
          email: session.email,
          name: session.name,
          sessionId: session.id,
          method: 'google',
          reason: 'Cuenta no habilitada como cliente',
        });
        await deps.authRepository.logout();
        throw CreateCustomerAccessError(email);
      }

      const synced = await SyncCustomerLink(deps, platformUser, session.id, session.name);
      const result = MapCustomerSession(synced, session.id);
      await LogLoginHistory({
        historyRepository: deps.historyRepository,
        role: 'client',
        email: session.email,
        name: session.name,
        sessionId: session.id,
        method: 'google',
      });
      return result;
    },
  };
}

export function createRegisterCustomerUseCase(
  deps: CustomerUseCaseDeps
): UseCase<RegisterCustomerInput, CustomerSessionOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);
      const existing = await deps.platformUserRepository.getByEmail(email);
      const now = new Date().toISOString();

      if (existing?.authUid) {
        throw new Error('Este correo ya tiene una cuenta. Inicia sesión en su lugar.');
      }

      const session = await deps.authRepository.registerWithEmail(
        email,
        input.password,
        input.name.trim()
      );

      if (existing) {
        if (existing.role === PLATFORM_USER_ROLE.Administrator) {
          await deps.authRepository.logout();
          throw new Error('Este correo pertenece a una cuenta administrativa.');
        }

        await deps.platformUserRepository.update(existing.id, {
          authUid: session.id,
          name: input.name.trim() || existing.name,
          phone: input.phone?.trim() || existing.phone,
          status: PLATFORM_USER_STATUS.Active,
          lastLogin: now,
        });

        const linked = await deps.platformUserRepository.getById(existing.id);
        if (!linked || !IsActiveCustomer(linked)) {
          await deps.authRepository.logout();
          throw CreateCustomerAccessError(email);
        }

        const linkedSession = MapCustomerSession(linked, session.id);
        await deps.historyRepository.log({
          action: HISTORY_ACTION.Update,
          section: HISTORY_SECTION.Users,
          actorType: HISTORY_ACTOR_TYPE.Client,
          itemName: linked.name,
          itemId: linked.id,
          details: `Cliente "${linked.name}" vinculó su cuenta en la tienda`,
          actorEmail: email,
          actorName: input.name.trim(),
        });
        await LogLoginHistory({
          historyRepository: deps.historyRepository,
          role: 'client',
          email: session.email,
          name: session.name,
          sessionId: session.id,
          method: 'email',
        });
        return linkedSession;
      }

      const newUser: PlatformUser = {
        id: `cli-${session.id}`,
        code: GenerateCustomerCode(),
        name: input.name.trim(),
        email,
        phone: input.phone?.trim() || undefined,
        role: PLATFORM_USER_ROLE.Customer,
        status: PLATFORM_USER_STATUS.Active,
        authUid: session.id,
        createdAt: now,
        lastLogin: now,
      };

      await deps.platformUserRepository.create(newUser);
      await deps.historyRepository.log({
        action: HISTORY_ACTION.Create,
        section: HISTORY_SECTION.Users,
        actorType: HISTORY_ACTOR_TYPE.Client,
        itemName: newUser.name,
        itemId: newUser.id,
        details: `Cliente "${newUser.name}" se registró en la tienda`,
        actorEmail: email,
        actorName: input.name.trim(),
      });
      await LogLoginHistory({
        historyRepository: deps.historyRepository,
        role: 'client',
        email: session.email,
        name: session.name,
        sessionId: session.id,
        method: 'email',
      });
      return MapCustomerSession(newUser, session.id);
    },
  };
}

export function createResolveCustomerSessionUseCase(
  deps: CustomerUseCaseDeps
): UseCase<{ authUid: string; email: string; name: string }, CustomerSessionOutput | null> {
  return {
    async execute(input) {
      const platformUser = await ResolvePlatformCustomer(deps, input.authUid, input.email);
      if (!platformUser) return null;
      const synced = await SyncCustomerLink(deps, platformUser, input.authUid, input.name);
      return MapCustomerSession(synced, input.authUid);
    },
  };
}

export function createGetCustomerProfileUseCase(
  deps: CustomerUseCaseDeps
): UseCase<{ platformUserId: string }, PlatformUser | null> {
  return {
    async execute(input) {
      const user = await deps.platformUserRepository.getById(input.platformUserId);
      return IsActiveCustomer(user) ? user : null;
    },
  };
}

export function createUpdateCustomerProfileUseCase(
  deps: CustomerUseCaseDeps
): UseCase<UpdateCustomerProfileInput, { platformUserId: string }> {
  return {
    async execute(input) {
      const current = await deps.platformUserRepository.getById(input.platformUserId);
      if (!IsActiveCustomer(current)) {
        throw new Error('No se encontró el perfil del cliente.');
      }

      await deps.platformUserRepository.update(input.platformUserId, {
        name: input.name.trim(),
        phone: input.phone?.trim() || undefined,
        address: input.address?.trim() || undefined,
        region: input.region?.trim() || undefined,
        documentType: input.documentType as PlatformUser['documentType'],
        documentNumber: input.documentNumber?.trim() || undefined,
        editedAt: new Date().toISOString(),
      });

      if (input.name.trim() !== current.name) {
        await deps.authRepository.updateDisplayName(input.name.trim());
      }

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Update,
        section: HISTORY_SECTION.Users,
        actorType: HISTORY_ACTOR_TYPE.Client,
        itemName: input.name.trim() || current.name,
        itemId: input.platformUserId,
        details: `Cliente "${input.name.trim() || current.name}" actualizó su perfil`,
        actorEmail: current.email,
        actorName: input.name.trim() || current.name,
      });

      return { platformUserId: input.platformUserId };
    },
  };
}
