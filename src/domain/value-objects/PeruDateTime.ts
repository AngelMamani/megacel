export const PERU_TIME_ZONE = 'America/Lima';

/** Fecha calendario YYYY-MM-DD en hora de Perú (no UTC). */
export function GetPeruCalendarDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PERU_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Interpreta YYYY-MM-DD como fecha local; ISO completo como instante UTC. */
export function ParseOrderDateValue(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const calendarMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (calendarMatch) {
    const year = Number(calendarMatch[1]);
    const month = Number(calendarMatch[2]);
    const day = Number(calendarMatch[3]);
    const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function FormatPeruDateTime(value: string): string {
  const date = ParseOrderDateValue(value);
  if (!date) return value;

  const hasTime = value.includes('T') || /\d{1,2}:\d{2}/.test(value);

  return new Intl.DateTimeFormat('es-PE', {
    timeZone: PERU_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

export function GetOrderSortTimestamp(order: { createdAt?: string; date: string }): number {
  const value = order.createdAt ?? order.date;
  const parsed = ParseOrderDateValue(value);
  return parsed?.getTime() ?? 0;
}

export function GetTimestampCalendarDateKeyInPeru(value: string): string | null {
  const parsed = ParseOrderDateValue(value);
  if (!parsed) return null;

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PERU_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed);
}

export function IsTimestampFromTodayInPeru(value: string): boolean {
  const key = GetTimestampCalendarDateKeyInPeru(value);
  if (!key) return false;
  return key === GetPeruCalendarDateKey();
}

export function IsOrderFromTodayInPeru(order: { createdAt?: string; date?: string }): boolean {
  const value = order.createdAt ?? order.date;
  if (!value) return false;
  return IsTimestampFromTodayInPeru(value);
}

export function FormatPeruTodayLabel(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('es-PE', {
    timeZone: PERU_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
