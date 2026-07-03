import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type LogoutDeps = {
  authRepository: IAuthRepository;
};

export function createLogoutUseCase(deps: LogoutDeps): UseCase<void, void> {
  return {
    async execute() {
      await deps.authRepository.logout();
    },
  };
}
