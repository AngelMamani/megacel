import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.ts';
import type { IAdminRepository } from '../../../domain/repositories/IAdminRepository.ts';
import { normalizeEmail } from '../../../domain/value-objects/Email.ts';
import { createUnauthorizedAccessError } from '../../../domain/errors/UnauthorizedAccessError.ts';
import { PRIMARY_ADMIN_EMAIL } from '../../config/AdminConfig.ts';
import type { LoginWithEmailInput, LoginWithEmailOutput } from '../../dto/auth/LoginWithEmailDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type LoginWithEmailDeps = {
  authRepository: IAuthRepository;
  adminRepository: IAdminRepository;
};

export function createLoginWithEmailUseCase(
  deps: LoginWithEmailDeps
): UseCase<LoginWithEmailInput, LoginWithEmailOutput> {
  return {
    async execute(input) {
      const normalizedEmail = normalizeEmail(input.email);
      const session = await deps.authRepository.loginWithEmail(normalizedEmail, input.password);

      const isPrimary = normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();
      const isAdmin = isPrimary ? true : await deps.adminRepository.isAdminEmail(session.email);

      if (!isAdmin) {
        await deps.authRepository.logout();
        const error = createUnauthorizedAccessError(
          `El correo ${session.email} no está autorizado para acceder al panel administrativo.`
        );
        throw new Error(error.message);
      }

      return {
        sessionId: session.id,
        name: session.name,
        email: session.email,
      };
    },
  };
}
