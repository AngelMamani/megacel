export const DOMAIN_ERROR_CODE = {
  InsufficientStock: 'INSUFFICIENT_STOCK',
  InvalidStock: 'INVALID_STOCK',
  UnauthorizedAccess: 'UNAUTHORIZED_ACCESS',
  EntityNotFound: 'ENTITY_NOT_FOUND',
  DuplicateEntity: 'DUPLICATE_ENTITY',
  Validation: 'VALIDATION_ERROR',
} as const;

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODE)[keyof typeof DOMAIN_ERROR_CODE];

export interface DomainError {
  readonly code: DomainErrorCode;
  readonly message: string;
}

export function isDomainError(value: unknown): value is DomainError {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as DomainError;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}
