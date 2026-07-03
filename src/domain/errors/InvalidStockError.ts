import { DOMAIN_ERROR_CODE, type DomainError } from './DomainError.ts';

export function createInvalidStockError(message: string): DomainError {
  return {
    code: DOMAIN_ERROR_CODE.InvalidStock,
    message,
  };
}
