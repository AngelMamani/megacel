import type { HistoryEntry } from '../../../../domain/entities/HistoryEntry.ts';
import { HISTORY_ACTION } from '../../../../domain/value-objects/HistoryAction.ts';
import {
  GetPeruCalendarDateKey,
  GetTimestampCalendarDateKeyInPeru,
  ParseOrderDateValue,
  PERU_TIME_ZONE,
} from '../../../../domain/value-objects/PeruDateTime.ts';
import type { HistoryMonthGroup, HistoryStats, HistoryWeekdayTab, HistoryFeedCategory } from '../types/HistoryPageTypes.ts';
import { HISTORY_ACTOR_TYPE } from '../../../../domain/value-objects/HistoryActorType.ts';

const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
const WEEKDAY_FULL = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export type HistoryActionTone =
  | 'create'
  | 'update'
  | 'delete'
  | 'deactivate'
  | 'reactivate'
  | 'login'
  | 'login_failed'
  | 'neutral';
export type HistorySectionTone =
  | 'products'
  | 'categories'
  | 'brands'
  | 'orders'
  | 'users'
  | 'auth'
  | 'neutral';

const ACTION_LABELS: Record<string, string> = {
  create: 'Creó',
  update: 'Editó',
  delete: 'Eliminó',
  deactivate: 'Desactivó',
  reactivate: 'Reactivó',
  login: 'Inició sesión',
  login_failed: 'Intento fallido',
};

const SECTION_LABELS: Record<string, string> = {
  products: 'Productos',
  categories: 'Categorías',
  brands: 'Marcas',
  orders: 'Pedidos',
  users: 'Usuarios',
  auth: 'Autenticación',
};

export const GetActionLabel = (action: string): string => ACTION_LABELS[action] ?? action;

export const GetSectionLabel = (section: string): string => SECTION_LABELS[section] ?? section;

export const ResolveHistoryFeedCategory = (entry: HistoryEntry): HistoryFeedCategory => {
  if (entry.action === HISTORY_ACTION.Login || entry.action === HISTORY_ACTION.LoginFailed) {
    return 'login';
  }
  if (entry.actorType === HISTORY_ACTOR_TYPE.Client) return 'client';
  if (entry.actorType === HISTORY_ACTOR_TYPE.Admin) return 'admin';
  if (entry.section === 'auth') return 'login';
  if (entry.details?.toLowerCase().includes('pedido online')) return 'client';
  if (entry.details?.toLowerCase().includes('cliente')) return 'client';
  return 'admin';
};

export const GetActorTypeLabel = (entry: HistoryEntry): string => {
  if (entry.action === HISTORY_ACTION.LoginFailed) return 'Intento fallido';
  const category = ResolveHistoryFeedCategory(entry);
  if (category === 'login') return 'Inicio de sesión';
  if (category === 'client') return 'Cliente';
  return 'Administrador';
};

export const GetActionTone = (action: string): HistoryActionTone => {
  if (action === HISTORY_ACTION.Create) return 'create';
  if (action === HISTORY_ACTION.Update) return 'update';
  if (action === HISTORY_ACTION.Delete) return 'delete';
  if (action === HISTORY_ACTION.Deactivate) return 'deactivate';
  if (action === HISTORY_ACTION.Reactivate) return 'reactivate';
  if (action === HISTORY_ACTION.Login) return 'login';
  if (action === HISTORY_ACTION.LoginFailed) return 'login_failed';
  return 'neutral';
};

export const GetSectionTone = (section: string): HistorySectionTone => {
  if (section === 'products') return 'products';
  if (section === 'categories') return 'categories';
  if (section === 'brands') return 'brands';
  if (section === 'orders') return 'orders';
  if (section === 'users') return 'users';
  if (section === 'auth') return 'auth';
  return 'neutral';
};

export const FormatHistoryDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const GetEntryDateKeyInPeru = (timestamp: string): string | null =>
  GetTimestampCalendarDateKeyInPeru(timestamp);

export const ShiftCalendarDateKey = (dateKey: string, days: number): string => {
  const parsed = ParseOrderDateValue(dateKey);
  if (!parsed) return dateKey;
  parsed.setDate(parsed.getDate() + days);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const GetWeekdayIndexInPeru = (dateKey: string): number => {
  const parsed = ParseOrderDateValue(dateKey);
  if (!parsed) return 1;

  const weekday =
    new Intl.DateTimeFormat('en-US', {
      timeZone: PERU_TIME_ZONE,
      weekday: 'short',
    })
      .formatToParts(parsed)
      .find((part) => part.type === 'weekday')?.value ?? 'Mon';

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday] ?? 1;
};

export const BuildCurrentWeekWeekdayTabs = (
  entries: HistoryEntry[],
  options: {
    searchQuery: string;
    actionFilter: string;
    sectionFilter: string;
    categoryFilter: HistoryFeedCategory;
  }
): HistoryWeekdayTab[] => {
  const todayKey = GetPeruCalendarDateKey();
  const daysFromMonday = (GetWeekdayIndexInPeru(todayKey) + 6) % 7;
  const mondayKey = ShiftCalendarDateKey(todayKey, -daysFromMonday);

  const baseFiltered = FilterHistoryEntries(entries, {
    ...options,
    dateFilter: '',
  });

  return WEEKDAY_SHORT.map((weekdayLabel, index) => {
    const dateKey = ShiftCalendarDateKey(mondayKey, index);
    const parsed = ParseOrderDateValue(dateKey);
    const dayNum = parsed?.getDate() ?? 1;
    const monthNum = (parsed?.getMonth() ?? 0) + 1;
    const entryCount = baseFiltered.filter(
      (entry) => GetEntryDateKeyInPeru(entry.timestamp) === dateKey
    ).length;

    return {
      key: dateKey,
      weekdayLabel,
      weekdayFull: WEEKDAY_FULL[index],
      dateLabel: `${String(dayNum).padStart(2, '0')}/${String(monthNum).padStart(2, '0')}`,
      isToday: dateKey === todayKey,
      entryCount,
    };
  });
};

export const GetDefaultWeekdayTabKey = (tabs: HistoryWeekdayTab[]): string => {
  const todayTab = tabs.find((tab) => tab.isToday);
  if (todayTab) return todayTab.key;
  return tabs[tabs.length - 1]?.key ?? GetPeruCalendarDateKey();
};

export const FormatWeekRangeLabel = (tabs: HistoryWeekdayTab[]): string => {
  if (tabs.length === 0) return '';

  const first = ParseOrderDateValue(tabs[0].key);
  const last = ParseOrderDateValue(tabs[tabs.length - 1].key);
  if (!first || !last) return '';

  const monthFormatter = new Intl.DateTimeFormat('es-PE', {
    timeZone: PERU_TIME_ZONE,
    month: 'short',
    year: 'numeric',
  });

  const firstMonth = monthFormatter.format(first);
  const lastMonth = monthFormatter.format(last);

  if (firstMonth === lastMonth) {
    return `Semana del ${first.getDate()} al ${last.getDate()} de ${firstMonth}`;
  }

  return `Semana del ${first.getDate()} ${firstMonth} al ${last.getDate()} ${lastMonth}`;
};

const FormatMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('es-PE', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

const GetMonthKey = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const GetDayKey = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const FormatDayLabel = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return `${dayNames[date.getDay()]} ${day}`;
};

export const IsToday = (dateString: string): boolean =>
  GetEntryDateKeyInPeru(dateString) === GetPeruCalendarDateKey();

export const CalculateHistoryStats = (entries: HistoryEntry[]): HistoryStats => {
  const today = entries.filter((entry) => IsToday(entry.timestamp)).length;
  const creates = entries.filter((entry) => entry.action === HISTORY_ACTION.Create).length;
  const modifications = entries.filter(
    (entry) =>
      entry.action === HISTORY_ACTION.Update ||
      entry.action === HISTORY_ACTION.Delete ||
      entry.action === HISTORY_ACTION.Deactivate ||
      entry.action === HISTORY_ACTION.Reactivate
  ).length;

  return {
    Total: entries.length,
    Today: today,
    Creates: creates,
    Modifications: modifications,
  };
};

export const FilterHistoryEntries = (
  entries: HistoryEntry[],
  options: {
    searchQuery: string;
    actionFilter: string;
    sectionFilter: string;
    dateFilter: string;
    categoryFilter?: HistoryFeedCategory;
  }
): HistoryEntry[] => {
  const query = options.searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    const matchesSearch =
      !query ||
      entry.itemName.toLowerCase().includes(query) ||
      entry.itemId.toLowerCase().includes(query) ||
      entry.details?.toLowerCase().includes(query) ||
      entry.actorEmail?.toLowerCase().includes(query) ||
      entry.actorName?.toLowerCase().includes(query);

    const matchesAction = options.actionFilter === 'all' || entry.action === options.actionFilter;
    const matchesSection = options.sectionFilter === 'all' || entry.section === options.sectionFilter;
    const matchesDate =
      !options.dateFilter ||
      GetEntryDateKeyInPeru(entry.timestamp) === options.dateFilter;
    const matchesCategory =
      !options.categoryFilter || ResolveHistoryFeedCategory(entry) === options.categoryFilter;

    return matchesSearch && matchesAction && matchesSection && matchesDate && matchesCategory;
  });
};

export const GroupHistoryByMonthAndDay = (entries: HistoryEntry[]): HistoryMonthGroup[] => {
  const grouped: Record<string, Record<string, HistoryEntry[]>> = {};

  entries.forEach((entry) => {
    const monthKey = GetMonthKey(entry.timestamp);
    const dayKey = GetDayKey(entry.timestamp);

    if (!grouped[monthKey]) grouped[monthKey] = {};
    if (!grouped[monthKey][dayKey]) grouped[monthKey][dayKey] = [];
    grouped[monthKey][dayKey].push(entry);
  });

  return Object.entries(grouped)
    .map(([monthKey, days]) => ({
      key: monthKey,
      label: FormatMonthYear(Object.values(days)[0][0].timestamp),
      days: Object.entries(days)
        .map(([dayKey, dayEntries]) => ({
          key: dayKey,
          label: FormatDayLabel(dayEntries[0].timestamp),
          entries: [...dayEntries].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
        }))
        .sort((a, b) => b.key.localeCompare(a.key)),
    }))
    .sort((a, b) => b.key.localeCompare(a.key));
};
