import { DOMAIN_ERROR_CODE, type DomainError } from './DomainError.ts';

export function createDuplicateEntityError(entityName: string, identifier: string): DomainError {
  return {
    code: DOMAIN_ERROR_CODE.DuplicateEntity,
    message: `${entityName} "${identifier}" ya existe`,
  };
}
