import { DOMAIN_ERROR_CODE, type DomainError } from './DomainError.ts';

export function createInsufficientStockError(available: number, requested: number): DomainError {
  return {
    code: DOMAIN_ERROR_CODE.InsufficientStock,
    message: `Stock insuficiente. Disponible: ${available}, solicitado: ${requested}`,
  };
}
