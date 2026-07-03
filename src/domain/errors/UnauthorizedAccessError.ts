import { DOMAIN_ERROR_CODE, type DomainError } from './DomainError.ts';

export function createUnauthorizedAccessError(message = 'Acceso no autorizado'): DomainError {
  return {
    code: DOMAIN_ERROR_CODE.UnauthorizedAccess,
    message,
  };
}
