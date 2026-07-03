import { DOMAIN_ERROR_CODE, type DomainError } from './DomainError.ts';

export function createEntityNotFoundError(entityName: string, id: string): DomainError {
  return {
    code: DOMAIN_ERROR_CODE.EntityNotFound,
    message: `${entityName} con id "${id}" no encontrado`,
  };
}
