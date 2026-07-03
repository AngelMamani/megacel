import type { HistoryFeedCategory } from '../types/HistoryPageTypes.ts';

interface HistoryCategoryTabsProps {
  SelectedCategory: HistoryFeedCategory;
  AdminCount: number;
  ClientCount: number;
  LoginCount: number;
  OnSelect: (category: HistoryFeedCategory) => void;
}

export const HistoryCategoryTabs = ({
  SelectedCategory,
  AdminCount,
  ClientCount,
  LoginCount,
  OnSelect,
}: HistoryCategoryTabsProps) => (
  <nav className="history-categories" aria-label="Tipo de actividad">
    <button
      type="button"
      className={`history-categories__tab${SelectedCategory === 'admin' ? ' is-active' : ''}`}
      onClick={() => OnSelect('admin')}
    >
      <span className="history-categories__label">Administrador</span>
      <span className="history-categories__count">{AdminCount}</span>
    </button>
    <button
      type="button"
      className={`history-categories__tab${SelectedCategory === 'client' ? ' is-active' : ''}`}
      onClick={() => OnSelect('client')}
    >
      <span className="history-categories__label">Cliente</span>
      <span className="history-categories__count">{ClientCount}</span>
    </button>
    <button
      type="button"
      className={`history-categories__tab${SelectedCategory === 'login' ? ' is-active' : ''}`}
      onClick={() => OnSelect('login')}
    >
      <span className="history-categories__label">Inicios de sesión</span>
      <span className="history-categories__count">{LoginCount}</span>
    </button>
  </nav>
);
