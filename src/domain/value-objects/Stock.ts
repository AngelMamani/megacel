import { createInsufficientStockError } from '../errors/InsufficientStockError.ts';
import { createInvalidStockError } from '../errors/InvalidStockError.ts';
import type { DomainError } from '../errors/DomainError.ts';

export function isValidStockValue(stock: number): boolean {
  return Number.isFinite(stock) && stock >= 0;
}

export function hasEnoughStock(available: number, requested: number): boolean {
  return isValidStockValue(available) && requested > 0 && available >= requested;
}

export function validateStockForSale(available: number | undefined | null, requested: number): DomainError | null {
  if (available === undefined || available === null) {
    return createInvalidStockError('El producto no tiene stock configurado');
  }

  if (!isValidStockValue(available)) {
    return createInvalidStockError('El stock del producto no es válido');
  }

  if (requested <= 0) {
    return createInvalidStockError('La cantidad debe ser mayor a cero');
  }

  if (available < requested) {
    return createInsufficientStockError(available, requested);
  }

  return null;
}

export function isLowStock(stock: number, minStock: number): boolean {
  return isValidStockValue(stock) && stock <= minStock;
}
