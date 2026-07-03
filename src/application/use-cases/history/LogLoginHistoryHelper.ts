import type { IAdminRepository } from '../../../domain/repositories/IAdminRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { IPlatformUserRepository } from '../../../domain/repositories/IPlatformUserRepository.ts';
import { PRIMARY_ADMIN_EMAIL } from '../../config/AdminConfig.ts';
import { normalizeEmail } from '../../../domain/value-objects/Email.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';
import { PLATFORM_USER_ROLE } from '../../../domain/value-objects/PlatformUserRole.ts';

export type AuthAttemptRole = 'admin' | 'client' | 'unknown';
export type AuthAttemptMethod = 'email' | 'google';
export type AuthAttemptOutcome = 'success' | 'failure';

export type InferAuthRoleDeps = {
  adminRepository?: IAdminRepository;
  platformUserRepository?: IPlatformUserRepository;
};

interface LogAuthAttemptParams {
  historyRepository: IHistoryRepository;
  outcome: AuthAttemptOutcome;
  role: AuthAttemptRole;
  email?: string;
  name?: string;
  sessionId?: string;
  method: AuthAttemptMethod;
  reason?: string;
}

export async function InferAuthAttemptRole(
  deps: InferAuthRoleDeps,
  email: string
): Promise<AuthAttemptRole> {
  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return 'admin';
  }

  if (deps.adminRepository && (await deps.adminRepository.isAdminEmail(normalizedEmail))) {
    return 'admin';
  }

  if (deps.platformUserRepository) {
    const platformUser = await deps.platformUserRepository.getByEmail(normalizedEmail);
    if (platformUser?.role === PLATFORM_USER_ROLE.Customer) {
      return 'client';
    }
  }

  return 'unknown';
}

export function GetAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return 'Error desconocido al iniciar sesión';
}

export async function LogAuthAttempt({
  historyRepository,
  outcome,
  role,
  email,
  name,
  sessionId,
  method,
  reason,
}: LogAuthAttemptParams): Promise<void> {
  try {
    const methodLabel = method === 'google' ? 'Google' : 'correo y contraseña';
    const roleLabel =
      role === 'admin' ? 'administrador' : role === 'client' ? 'cliente' : 'usuario';
    const normalizedEmail = email ? normalizeEmail(email) : '';
    const displayName = name?.trim() || normalizedEmail || 'Intento sin correo';
    const action =
      outcome === 'success' ? HISTORY_ACTION.Login : HISTORY_ACTION.LoginFailed;

    let details =
      outcome === 'success'
        ? `Inicio de sesión exitoso de ${roleLabel} vía ${methodLabel}`
        : `Intento fallido de inicio de sesión (${roleLabel}) vía ${methodLabel}`;

    if (outcome === 'failure' && reason?.trim()) {
      details += `: ${reason.trim()}`;
    }

    await historyRepository.log({
      action,
      section: HISTORY_SECTION.Auth,
      actorType:
        role === 'admin'
          ? HISTORY_ACTOR_TYPE.Admin
          : role === 'client'
            ? HISTORY_ACTOR_TYPE.Client
            : undefined,
      itemName: displayName,
      itemId: sessionId || `attempt-${normalizedEmail || method}-${Date.now()}`,
      details,
      actorEmail: normalizedEmail || undefined,
      actorName: name?.trim() || undefined,
    });
  } catch (error) {
    console.error('Error registrando historial de autenticación:', error);
  }
}

interface LogLoginHistoryParams {
  historyRepository: IHistoryRepository;
  role: 'admin' | 'client';
  email: string;
  name: string;
  sessionId: string;
  method: AuthAttemptMethod;
}

export async function LogLoginHistory({
  historyRepository,
  role,
  email,
  name,
  sessionId,
  method,
}: LogLoginHistoryParams): Promise<void> {
  await LogAuthAttempt({
    historyRepository,
    outcome: 'success',
    role,
    email,
    name,
    sessionId,
    method,
  });
}

interface LogLoginFailedAttemptParams {
  historyRepository: IHistoryRepository;
  role: AuthAttemptRole;
  method: AuthAttemptMethod;
  email?: string;
  name?: string;
  sessionId?: string;
  reason?: string;
}

export async function LogLoginFailedAttempt({
  historyRepository,
  role,
  method,
  email,
  name,
  sessionId,
  reason,
}: LogLoginFailedAttemptParams): Promise<void> {
  await LogAuthAttempt({
    historyRepository,
    outcome: 'failure',
    role,
    email,
    name,
    sessionId,
    method,
    reason,
  });
}
