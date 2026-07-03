import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import './History.css';
import type { HistoryEntry } from '../../../domain/entities/HistoryEntry.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { useApplication, useInfrastructure } from '../../providers/DependencyProvider.tsx';
import { HistoryCategoryTabs } from './components/HistoryCategoryTabs.tsx';
import { HistoryCommandBar } from './components/HistoryCommandBar.tsx';
import { HistoryDayView } from './components/HistoryDayView.tsx';
import { HistoryEmptyState } from './components/HistoryEmptyState.tsx';
import { HistoryKpiStrip } from './components/HistoryKpiStrip.tsx';
import { HistoryPageHeader } from './components/HistoryPageHeader.tsx';
import { HistoryWeekdayTabs } from './components/HistoryWeekdayTabs.tsx';
import type { HistoryFeedCategory } from './types/HistoryPageTypes.ts';
import {
  BuildCurrentWeekWeekdayTabs,
  CalculateHistoryStats,
  FilterHistoryEntries,
  FormatWeekRangeLabel,
  GetDefaultWeekdayTabKey,
  ResolveHistoryFeedCategory,
} from './utils/historyPresentationUtils.ts';

export const History = () => {
  const { repositories, migrateLegacyLocalHistory } = useInfrastructure();
  const application = useApplication();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [actionFilter, setActionFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<HistoryFeedCategory>('admin');
  const [selectedDayKey, setSelectedDayKey] = useState('');
  const [isCreatingTestEntry, setIsCreatingTestEntry] = useState(false);
  const [testWriteError, setTestWriteError] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    migrateLegacyLocalHistory().catch(() => undefined);

    const unsubscribe = repositories.history.subscribe(
      (items) => {
        setHistory(items);
        setIsLoading(false);
        setLoadError('');
      },
      (error) => {
        console.error('Error suscribiéndose al historial:', error);
        const message =
          error instanceof Error ? error.message : 'No se pudo cargar el historial desde Firebase.';
        setLoadError(message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [repositories.history, migrateLegacyLocalHistory]);

  useEffect(() => {
    const HandleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', HandleKeyDown);
    return () => window.removeEventListener('keydown', HandleKeyDown);
  }, [searchQuery]);

  const isSearching = searchQuery !== deferredSearch;

  const weekdayTabs = useMemo(
    () =>
      BuildCurrentWeekWeekdayTabs(history, {
        searchQuery: deferredSearch,
        actionFilter,
        sectionFilter,
        categoryFilter,
      }),
    [history, deferredSearch, actionFilter, sectionFilter, categoryFilter]
  );

  useEffect(() => {
    if (weekdayTabs.length === 0) return;

    const isSelectedInWeek = weekdayTabs.some((tab) => tab.key === selectedDayKey);
    if (!selectedDayKey || !isSelectedInWeek) {
      setSelectedDayKey(GetDefaultWeekdayTabKey(weekdayTabs));
    }
  }, [weekdayTabs, selectedDayKey]);

  const filteredHistory = useMemo(
    () =>
      FilterHistoryEntries(history, {
        searchQuery: deferredSearch,
        actionFilter,
        sectionFilter,
        dateFilter: selectedDayKey,
        categoryFilter,
      }),
    [history, deferredSearch, actionFilter, sectionFilter, selectedDayKey, categoryFilter]
  );

  const categoryCounts = useMemo(() => {
    const base = FilterHistoryEntries(history, {
      searchQuery: deferredSearch,
      actionFilter,
      sectionFilter,
      dateFilter: selectedDayKey,
    });

    return {
      admin: base.filter((entry) => ResolveHistoryFeedCategory(entry) === 'admin').length,
      client: base.filter((entry) => ResolveHistoryFeedCategory(entry) === 'client').length,
      login: base.filter((entry) => ResolveHistoryFeedCategory(entry) === 'login').length,
    };
  }, [history, deferredSearch, actionFilter, sectionFilter, selectedDayKey]);

  const stats = useMemo(() => CalculateHistoryStats(filteredHistory), [filteredHistory]);
  const weekLabel = useMemo(() => FormatWeekRangeLabel(weekdayTabs), [weekdayTabs]);

  const selectedTab = useMemo(
    () => weekdayTabs.find((tab) => tab.key === selectedDayKey),
    [weekdayTabs, selectedDayKey]
  );

  const dayEntries = useMemo(
    () =>
      [...filteredHistory].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [filteredHistory]
  );

  const showTestAction =
    history.length === 0 && actionFilter === 'all' && sectionFilter === 'all';

  const handleCreateTestEntry = async () => {
    if (isCreatingTestEntry) return;
    setIsCreatingTestEntry(true);
    setTestWriteError('');

    try {
      await application.history.log.execute({
        action: 'create',
        section: 'products',
        actorType: HISTORY_ACTOR_TYPE.Admin,
        itemName: 'Registro de prueba',
        itemId: `test-${Date.now()}`,
        details: 'Evento generado desde Historial para validar escritura en Firestore.',
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error creando registro de prueba:', error);
      setTestWriteError(err?.message || 'No se pudo escribir en Firestore.');
    } finally {
      setIsCreatingTestEntry(false);
    }
  };

  return (
    <div className="history-page">
      <HistoryPageHeader />

      <HistoryKpiStrip Stats={stats} />

      <HistoryCommandBar
        SearchQuery={searchQuery}
        OnSearchChange={setSearchQuery}
        OnClearSearch={() => setSearchQuery('')}
        IsSearching={isSearching}
        ActionFilter={actionFilter}
        OnActionFilterChange={setActionFilter}
        SectionFilter={sectionFilter}
        OnSectionFilterChange={setSectionFilter}
        ResultCount={filteredHistory.length}
        SearchInputRef={searchInputRef}
      />

      <HistoryCategoryTabs
        SelectedCategory={categoryFilter}
        AdminCount={categoryCounts.admin}
        ClientCount={categoryCounts.client}
        LoginCount={categoryCounts.login}
        OnSelect={setCategoryFilter}
      />

      {weekdayTabs.length > 0 && (
        <HistoryWeekdayTabs
          Tabs={weekdayTabs}
          SelectedKey={selectedDayKey}
          WeekLabel={weekLabel}
          OnSelect={setSelectedDayKey}
        />
      )}

      <div className="history-panel">
        {isLoading ? (
          <HistoryEmptyState Variant="loading" />
        ) : loadError ? (
          <HistoryEmptyState Variant="error" ErrorMessage={loadError} />
        ) : dayEntries.length > 0 && selectedTab ? (
          <HistoryDayView
            DayLabel={`${selectedTab.weekdayFull} ${selectedTab.dateLabel}`}
            Entries={dayEntries}
          />
        ) : (
          <HistoryEmptyState
            Variant="empty"
            ShowTestAction={showTestAction}
            IsCreatingTest={isCreatingTestEntry}
            TestWriteError={testWriteError}
            OnCreateTest={handleCreateTestEntry}
          />
        )}
      </div>
    </div>
  );
};
