export const APPLICATION_ERROR_CODE = {
  Validation: 'VALIDATION_ERROR',
  OperationFailed: 'OPERATION_FAILED',
} as const;

export type ApplicationErrorCode = (typeof APPLICATION_ERROR_CODE)[keyof typeof APPLICATION_ERROR_CODE];

export interface ApplicationError {
  readonly code: ApplicationErrorCode;
  readonly message: string;
}

export function createValidationError(message: string): ApplicationError {
  return { code: APPLICATION_ERROR_CODE.Validation, message };
}

export function createOperationFailedError(message: string): ApplicationError {
  return { code: APPLICATION_ERROR_CODE.OperationFailed, message };
}

export function isApplicationError(value: unknown): value is ApplicationError {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as ApplicationError;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}

/** Lanza un ApplicationError como excepción estándar para la capa de presentación. */
export function throwApplicationError(error: ApplicationError): never {
  throw new Error(error.message);
}
