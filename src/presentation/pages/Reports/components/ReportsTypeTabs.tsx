import { REPORT_TYPE_TABS } from '../utils/reportsPresentationUtils.ts';
import type { ReportType } from '../types/ReportsPageTypes.ts';

interface ReportsTypeTabsProps {
  SelectedType: ReportType;
  OnSelect: (type: ReportType) => void;
}

export const ReportsTypeTabs = ({ SelectedType, OnSelect }: ReportsTypeTabsProps) => (
  <nav className="reports-types" aria-label="Tipo de reporte">
    <div className="reports-types__list" role="tablist">
      {REPORT_TYPE_TABS.map((tab) => {
        const isActive = tab.id === SelectedType;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`reports-types__tab${isActive ? ' is-active' : ''}`}
            onClick={() => OnSelect(tab.id)}
          >
            <span className="reports-types__label">{tab.label}</span>
            <span className="reports-types__desc">{tab.description}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
