import type { RefObject } from 'react';
import type { CategorySortKey, CategoryViewMode } from '../types/CategoryPageTypes.ts';
import { IconClose, IconGrid, IconSearch, IconTable } from './CategoryIcons.tsx';

interface CategoryCommandBarProps {
  SearchQuery: string;
  OnSearchChange: (value: string) => void;
  OnClearSearch: () => void;
  IsSearching: boolean;
  ViewMode: CategoryViewMode;
  OnViewModeChange: (mode: CategoryViewMode) => void;
  SortBy: CategorySortKey;
  OnSortChange: (sort: CategorySortKey) => void;
  ResultCount: number;
  SearchInputRef?: RefObject<HTMLInputElement | null>;
}

const SortOptions: { key: CategorySortKey; label: string }[] = [
  { key: 'recent', label: 'Recientes' },
  { key: 'name', label: 'A-Z' },
  { key: 'products', label: 'Top productos' },
];

export const CategoryCommandBar = ({
  SearchQuery,
  OnSearchChange,
  OnClearSearch,
  IsSearching,
  ViewMode,
  OnViewModeChange,
  SortBy,
  OnSortChange,
  ResultCount,
  SearchInputRef,
}: CategoryCommandBarProps) => (
  <section className="categories-command" aria-label="Controles de categorías">
    <div className="categories-command__search">
      <IconSearch className="categories-command__search-icon" />
      <input
        ref={SearchInputRef}
        type="search"
        className="categories-command__search-input"
        placeholder="Buscar categorías... (Ctrl+K)"
        value={SearchQuery}
        onChange={(e) => OnSearchChange(e.target.value)}
        aria-label="Buscar categorías"
      />
      {SearchQuery && (
        <button
          type="button"
          className="categories-command__search-clear"
          onClick={OnClearSearch}
          aria-label="Limpiar búsqueda"
        >
          <IconClose size={14} />
        </button>
      )}
      {IsSearching && <span className="categories-command__search-pulse" aria-hidden="true" />}
    </div>

    <div className="categories-command__actions">
      <div className="categories-command__sort-pills" role="group" aria-label="Ordenar categorías">
        {SortOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`categories-command__sort-pill${SortBy === option.key ? ' is-active' : ''}`}
            onClick={() => OnSortChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="categories-command__view" role="group" aria-label="Modo de vista">
        <button
          type="button"
          className={`categories-command__view-btn${ViewMode === 'grid' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('grid')}
          title="Vista cuadrícula"
        >
          <IconGrid />
        </button>
        <button
          type="button"
          className={`categories-command__view-btn${ViewMode === 'table' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('table')}
          title="Vista tabla"
        >
          <IconTable />
        </button>
      </div>
    </div>

    <p className="categories-command__count">
      {ResultCount} {ResultCount === 1 ? 'categoría activa' : 'categorías activas'}
      {SearchQuery.trim() ? ' · filtradas' : ''}
    </p>
  </section>
);
