import type { RefObject } from 'react';
import type { BrandSortKey, BrandViewMode } from '../types/BrandPageTypes.ts';
import { IconClose, IconGrid, IconSearch, IconTable } from './BrandIcons.tsx';

interface BrandCommandBarProps {
  SearchQuery: string;
  OnSearchChange: (value: string) => void;
  OnClearSearch: () => void;
  IsSearching: boolean;
  ViewMode: BrandViewMode;
  OnViewModeChange: (mode: BrandViewMode) => void;
  SortBy: BrandSortKey;
  OnSortChange: (sort: BrandSortKey) => void;
  ResultCount: number;
  SearchInputRef?: RefObject<HTMLInputElement | null>;
}

const SortOptions: { key: BrandSortKey; label: string }[] = [
  { key: 'recent', label: 'Recientes' },
  { key: 'name', label: 'A-Z' },
  { key: 'products', label: 'Top productos' },
];

export const BrandCommandBar = ({
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
}: BrandCommandBarProps) => (
  <section className="brands-command" aria-label="Controles de marcas">
    <div className="brands-command__search">
      <IconSearch className="brands-command__search-icon" />
      <input
        ref={SearchInputRef}
        type="search"
        className="brands-command__search-input"
        placeholder="Buscar marcas... (Ctrl+K)"
        value={SearchQuery}
        onChange={(e) => OnSearchChange(e.target.value)}
        aria-label="Buscar marcas"
      />
      {SearchQuery && (
        <button
          type="button"
          className="brands-command__search-clear"
          onClick={OnClearSearch}
          aria-label="Limpiar búsqueda"
        >
          <IconClose size={14} />
        </button>
      )}
      {IsSearching && <span className="brands-command__search-pulse" aria-hidden="true" />}
    </div>

    <div className="brands-command__actions">
      <div className="brands-command__sort-pills" role="group" aria-label="Ordenar marcas">
        {SortOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`brands-command__sort-pill${SortBy === option.key ? ' is-active' : ''}`}
            onClick={() => OnSortChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="brands-command__view" role="group" aria-label="Modo de vista">
        <button
          type="button"
          className={`brands-command__view-btn${ViewMode === 'grid' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('grid')}
          title="Vista cuadrícula"
        >
          <IconGrid />
        </button>
        <button
          type="button"
          className={`brands-command__view-btn${ViewMode === 'table' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('table')}
          title="Vista tabla"
        >
          <IconTable />
        </button>
      </div>
    </div>

    <p className="brands-command__count">
      {ResultCount} {ResultCount === 1 ? 'marca activa' : 'marcas activas'}
      {SearchQuery.trim() ? ' · filtradas' : ''}
    </p>
  </section>
);
