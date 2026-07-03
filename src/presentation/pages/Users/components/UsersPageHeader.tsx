import type { ReactNode } from 'react';
import { IconPlus } from './UserIcons.tsx';

interface UsersPageHeaderProps {
  Badge: string;
  Title: string;
  Subtitle: string;
  Icon: ReactNode;
  OnBack?: () => void;
  CtaLabel?: string;
  OnCtaClick?: () => void;
}

export const UsersPageHeader = ({
  Badge,
  Title,
  Subtitle,
  Icon,
  OnBack,
  CtaLabel,
  OnCtaClick,
}: UsersPageHeaderProps) => (
  <>
    {OnBack && (
      <button type="button" className="users-back-btn" onClick={OnBack}>
        ← Volver al centro
      </button>
    )}
    <header className="users-hero">
      <div className="users-hero__mesh" aria-hidden="true">
        <span className="users-hero__blob users-hero__blob--1" />
        <span className="users-hero__blob users-hero__blob--2" />
        <span className="users-hero__blob users-hero__blob--3" />
      </div>
      <div className="users-hero__content">
        <div className="users-hero__badge">
          {Icon}
          <span>{Badge}</span>
        </div>
        <h1 className="users-hero__title">{Title}</h1>
        <p className="users-hero__subtitle">{Subtitle}</p>
      </div>
      {CtaLabel && OnCtaClick && (
        <button type="button" className="users-hero__cta" onClick={OnCtaClick}>
          <IconPlus size={18} />
          <span>{CtaLabel}</span>
          <span className="users-hero__cta-glow" aria-hidden="true" />
        </button>
      )}
    </header>
  </>
);
