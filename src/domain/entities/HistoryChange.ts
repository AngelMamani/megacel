/** Cambio puntual registrado en el historial de auditoría. */
export interface HistoryChange {
  field: string;
  before: string | number | boolean | null | undefined;
  after: string | number | boolean | null | undefined;
}
