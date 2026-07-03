export const DOCUMENT_TYPE = {
  Dni: 'DNI',
  Ce: 'CE',
  Ruc: 'RUC',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export function isDocumentType(value: string): value is DocumentType {
  return Object.values(DOCUMENT_TYPE).includes(value as DocumentType);
}
