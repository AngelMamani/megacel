import { IconPlus, IconTag } from './BrandIcons.tsx';

interface BrandPageHeaderProps {
  OnOpenCreate: () => void;
}

export const BrandPageHeader = ({ OnOpenCreate }: BrandPageHeaderProps) => (
  <header className="brands-hero">
    <div className="brands-hero__mesh" aria-hidden="true">
      <span className="brands-hero__blob brands-hero__blob--1" />
      <span className="brands-hero__blob brands-hero__blob--2" />
      <span className="brands-hero__blob brands-hero__blob--3" />
    </div>

    <div className="brands-hero__content">
      <div className="brands-hero__badge">
        <IconTag size={16} />
        <span>Catálogo · Marcas</span>
      </div>
      <h1 className="brands-hero__title">Centro de Marcas</h1>
      <p className="brands-hero__subtitle">
        Diseña, organiza y monitorea el ecosistema de marcas de MEGA CEL con control total en tiempo real.
      </p>
    </div>

    <button type="button" className="brands-hero__cta" onClick={OnOpenCreate}>
      <IconPlus size={18} />
      <span>Nueva Marca</span>
      <span className="brands-hero__cta-glow" aria-hidden="true" />
    </button>
  </header>
);
