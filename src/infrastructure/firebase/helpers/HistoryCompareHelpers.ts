import type { HistoryChange } from '../../../domain/entities/HistoryChange.ts';

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') {
    if (value > 100) {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
      }).format(value);
    }
    return value.toString();
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Ninguno';
    return `${value.length} elemento${value.length > 1 ? 's' : ''}`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return 'Ninguno';
    return `${keys.length} campo${keys.length > 1 ? 's' : ''}`;
  }
  return String(value);
}

export function compareHistoryObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fieldLabels?: Record<string, string>
): HistoryChange[] {
  const changes: HistoryChange[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const ignoredFields = new Set(['editedAt', 'createdAt', 'id', 'images']);

  for (const key of allKeys) {
    if (ignoredFields.has(key)) continue;

    const beforeValue = before[key];
    const afterValue = after[key];
    const beforeNormalized = beforeValue === null || beforeValue === undefined ? null : beforeValue;
    const afterNormalized = afterValue === null || afterValue === undefined ? null : afterValue;

    if (JSON.stringify(beforeNormalized) === JSON.stringify(afterNormalized)) continue;

    const fieldLabel = fieldLabels?.[key] || key.charAt(0).toUpperCase() + key.slice(1);
    changes.push({
      field: fieldLabel,
      before: formatValue(beforeValue),
      after: formatValue(afterValue),
    });
  }

  return changes;
}
