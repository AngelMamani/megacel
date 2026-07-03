import type { ReactNode } from 'react';

interface StoreFooterPanelProps {
  Id: string;
  Title: string;
  IsMobile: boolean;
  IsOpen: boolean;
  OnToggle: (id: string) => void;
  children: ReactNode;
  ClassName?: string;
}

export const StoreFooterPanel = ({
  Id,
  Title,
  IsMobile,
  IsOpen,
  OnToggle,
  children,
  ClassName = '',
}: StoreFooterPanelProps) => {
  const panelClass = [
    'store-footer__panel',
    IsMobile && IsOpen ? 'is-open' : '',
    IsMobile ? 'is-collapsible' : '',
    ClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={panelClass} id={Id}>
      {IsMobile ? (
        <button
          type="button"
          className="store-footer__panel-trigger"
          aria-expanded={IsOpen}
          aria-controls={`${Id}-content`}
          onClick={() => OnToggle(Id)}
        >
          <span className="store-footer__panel-title">{Title}</span>
          <span className="store-footer__panel-chevron" aria-hidden />
        </button>
      ) : (
        <h3 className="store-footer__title">{Title}</h3>
      )}

      <div
        id={`${Id}-content`}
        className="store-footer__panel-body"
        hidden={IsMobile && !IsOpen}
      >
        {children}
      </div>
    </section>
  );
};
