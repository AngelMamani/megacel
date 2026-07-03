import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.ts';
import type { IAdminRepository } from '../../../domain/repositories/IAdminRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { IPlatformUserRepository } from '../../../domain/repositories/IPlatformUserRepository.ts';
import type { PlatformUser } from '../../../domain/entities/PlatformUser.ts';
import { normalizeEmail } from '../../../domain/value-objects/Email.ts';
import { PRIMARY_ADMIN_EMAIL } from '../../config/AdminConfig.ts';
import { PLATFORM_USER_ROLE } from '../../../domain/value-objects/PlatformUserRole.ts';
import { PLATFORM_USER_STATUS } from '../../../domain/value-objects/PlatformUserStatus.ts';
import {
  CreateCustomerAccessError,
  IsActiveCustomer,
} from '../../../domain/services/CustomerAccessPolicy.ts';
import type {
  LoginUnifiedInput,
  ResolveSessionInput,
  UnifiedAuthOutput,
} from '../../dto/auth/UnifiedAuthDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';
import { LogLoginHistory, LogLoginFailedAttempt, GetAuthErrorMessage, InferAuthAttemptRole } from '../history/LogLoginHistoryHelper.ts';

export type UnifiedAuthDeps = {
  authRepository: IAuthRepository;
  adminRepository: IAdminRepository;
  platformUserRepository: IPlatformUserRepository;
  historyRepository: IHistoryRepository;
};

const GenerateCustomerCode = (): string =>
  `CLI-${Date.now().toString(36).toUpperCase().slice(-6)}`;

async function ResolvePlatformCustomer(
  deps: UnifiedAuthDeps,
  authUid: string,
  email: string
): Promise<PlatformUser | null> {
  const normalizedEmail = normalizeEmail(email);
  const [byUid, byEmail] = await Promise.all([
    deps.platformUserRepository.getByAuthUid(authUid),
    deps.platformUserRepository.getByEmail(normalizedEmail),
  ]);

  if (IsActiveCustomer(byUid)) return byUid;
  if (IsActiveCustomer(byEmail)) return byEmail;

  return null;
}

function ScheduleCustomerSync(
  deps: UnifiedAuthDeps,
  platformUser: PlatformUser,
  authUid: string,
  sessionName: string
): PlatformUser {
  const now = new Date().toISOString();
  const patch: Partial<PlatformUser> = {
    lastLogin: now,
    authUid,
  };

  if (!platformUser.name.trim() && sessionName.trim()) {
    patch.name = sessionName.trim();
  }

  const nextUser = { ...platformUser, ...patch };

  void deps.platformUserRepository.update(platformUser.id, patch).catch((error) => {
    console.error('Error sincronizando cliente en segundo plano:', error);
  });

  return nextUser;
}

async function ResolveAdminSession(
  deps: UnifiedAuthDeps,
  authUid: string,
  name: string,
  email: string
): Promise<UnifiedAuthOutput | null> {
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return {
      sessionId: authUid,
      name,
      email,
      role: 'admin',
    };
  }

  const isAdmin = await deps.adminRepository.isAdminEmail(email);
  if (!isAdmin) return null;

  return {
    sessionId: authUid,
    name,
    email,
    role: 'admin',
  };
}

async function ResolveCustomerSession(
  deps: UnifiedAuthDeps,
  authUid: string,
  name: string,
  email: string,
  autoCreate = false,
  existingCustomer?: PlatformUser | null
): Promise<UnifiedAuthOutput | null> {
  let platformUser = existingCustomer ?? (await ResolvePlatformCustomer(deps, authUid, email));

  if (!platformUser && autoCreate) {
    const normalizedEmail = normalizeEmail(email);
    const now = new Date().toISOString();
    const newUser: PlatformUser = {
      id: `cli-${authUid}`,
      code: GenerateCustomerCode(),
      name: name.trim() || 'Cliente MEGA CEL',
      email: normalizedEmail,
      role: PLATFORM_USER_ROLE.Customer,
      status: PLATFORM_USER_STATUS.Active,
      authUid,
      createdAt: now,
      lastLogin: now,
    };
    await deps.platformUserRepository.create(newUser);
    platformUser = newUser;
  }

  if (!platformUser || !IsActiveCustomer(platformUser)) return null;

  const synced = ScheduleCustomerSync(deps, platformUser, authUid, name);
  return {
    sessionId: authUid,
    name: synced.name,
    email: synced.email,
    role: 'cliente',
    platformUserId: synced.id,
    code: synced.code,
  };
}

async function ResolveUnifiedSession(
  deps: UnifiedAuthDeps,
  input: ResolveSessionInput,
  autoCreateCustomer = false
): Promise<UnifiedAuthOutput | null> {
  const normalizedEmail = normalizeEmail(input.email);

  if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return ResolveAdminSession(deps, input.authUid, input.name, input.email);
  }

  const [adminSession, platformUser] = await Promise.all([
    ResolveAdminSession(deps, input.authUid, input.name, input.email),
    ResolvePlatformCustomer(deps, input.authUid, input.email),
  ]);

  if (adminSession) return adminSession;

  return ResolveCustomerSession(
    deps,
    input.authUid,
    input.name,
    input.email,
    autoCreateCustomer,
    platformUser
  );
}

export function createResolveUnifiedSessionUseCase(
  deps: UnifiedAuthDeps
): UseCase<ResolveSessionInput, UnifiedAuthOutput | null> {
  return {
    async execute(input) {
      return ResolveUnifiedSession(deps, input, false);
    },
  };
}

export function createLoginUnifiedWithEmailUseCase(
  deps: UnifiedAuthDeps
): UseCase<LoginUnifiedInput, UnifiedAuthOutput> {
  return {
    async execute(input) {
      const email = normalizeEmail(input.email);

      let session;
      try {
        session = await deps.authRepository.loginWithEmail(email, input.password);
      } catch (error) {
        const role = await InferAuthAttemptRole(deps, email);
        await LogLoginFailedAttempt({
          historyRepository: deps.historyRepository,
          role,
          email,
          method: 'email',
          reason: GetAuthErrorMessage(error),
        });
        throw error;
      }

      const resolved = await ResolveUnifiedSession(
        deps,
        {
          authUid: session.id,
          email: session.email,
          name: session.name,
        },
        false
      );

      if (resolved) {
        await LogLoginHistory({
          historyRepository: deps.historyRepository,
          role: resolved.role === 'admin' ? 'admin' : 'client',
          email: session.email,
          name: session.name,
          sessionId: session.id,
          method: 'email',
        });
        return resolved;
      }

      const role = await InferAuthAttemptRole(deps, session.email);
      await LogLoginFailedAttempt({
        historyRepository: deps.historyRepository,
        role,
        email: session.email,
        name: session.name,
        sessionId: session.id,
        method: 'email',
        reason: 'Cuenta no autorizada en MEGA CEL',
      });
      await deps.authRepository.logout();
      throw CreateCustomerAccessError(session.email);
    },
  };
}

export function createLoginUnifiedWithGoogleUseCase(
  deps: UnifiedAuthDeps
): UseCase<void, UnifiedAuthOutput> {
  return {
    async execute() {
      let session;
      try {
        session = await deps.authRepository.loginWithGoogle();
      } catch (error) {
        await LogLoginFailedAttempt({
          historyRepository: deps.historyRepository,
          role: 'unknown',
          method: 'google',
          reason: GetAuthErrorMessage(error),
        });
        throw error;
      }

      const resolved = await ResolveUnifiedSession(
        deps,
        {
          authUid: session.id,
          email: session.email,
          name: session.name,
        },
        true
      );

      if (resolved) {
        await LogLoginHistory({
          historyRepository: deps.historyRepository,
          role: resolved.role === 'admin' ? 'admin' : 'client',
          email: session.email,
          name: session.name,
          sessionId: session.id,
          method: 'google',
        });
        return resolved;
      }

      const role = await InferAuthAttemptRole(deps, session.email);
      await LogLoginFailedAttempt({
        historyRepository: deps.historyRepository,
        role,
        email: session.email,
        name: session.name,
        sessionId: session.id,
        method: 'google',
        reason: 'Cuenta no autorizada en MEGA CEL',
      });
      await deps.authRepository.logout();
      throw CreateCustomerAccessError(session.email);
    },
  };
}
