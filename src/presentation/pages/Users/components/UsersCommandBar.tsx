import type { RefObject } from 'react';
import { IconClose, IconGrid, IconSearch, IconTable } from './UserIcons.tsx';

interface UsersCommandBarProps {
  SearchQuery: string;
  OnSearchChange: (value: string) => void;
  OnClearSearch: () => void;
  IsSearching: boolean;
  StatusFilter: string;
  OnStatusFilterChange: (value: string) => void;
  ViewMode: 'table' | 'grid';
  OnViewModeChange: (mode: 'table' | 'grid') => void;
  ResultCount: number;
  SearchInputRef?: RefObject<HTMLInputElement | null>;
}

export const UsersCommandBar = ({
  SearchQuery,
  OnSearchChange,
  OnClearSearch,
  IsSearching,
  StatusFilter,
  OnStatusFilterChange,
  ViewMode,
  OnViewModeChange,
  ResultCount,
  SearchInputRef,
}: UsersCommandBarProps) => (
  <section className="users-command" aria-label="Controles de clientes">
    <div className="users-command__search">
      <IconSearch className="users-command__search-icon" />
      <input
        ref={SearchInputRef}
        type="search"
        className="users-command__search-input"
        placeholder="Buscar clientes... (Ctrl+K)"
        value={SearchQuery}
        onChange={(e) => OnSearchChange(e.target.value)}
        aria-label="Buscar clientes"
      />
      {SearchQuery && (
        <button type="button" className="users-command__search-clear" onClick={OnClearSearch} aria-label="Limpiar búsqueda">
          <IconClose size={14} />
        </button>
      )}
      {IsSearching && <span className="users-command__search-pulse" aria-hidden="true" />}
    </div>

    <div className="users-command__actions">
      <select
        className="users-command__filter"
        value={StatusFilter}
        onChange={(e) => OnStatusFilterChange(e.target.value)}
        aria-label="Filtrar por estado"
      >
        <option value="all">Todos los estados</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>

      <div className="users-command__view" role="group" aria-label="Modo de vista">
        <button
          type="button"
          className={`users-command__view-btn${ViewMode === 'grid' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('grid')}
          title="Vista tarjetas"
        >
          <IconGrid />
        </button>
        <button
          type="button"
          className={`users-command__view-btn${ViewMode === 'table' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('table')}
          title="Vista tabla"
        >
          <IconTable />
        </button>
      </div>
    </div>

    <p className="users-command__count">
      {ResultCount} {ResultCount === 1 ? 'cliente' : 'clientes'}
      {SearchQuery.trim() || StatusFilter !== 'all' ? ' · filtrados' : ''}
    </p>
  </section>
);
