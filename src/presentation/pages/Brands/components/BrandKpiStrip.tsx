interface BrandKpiStripProps {
  TotalBrands: number;
  TotalProducts: number;
  AverageProducts: number;
  ActiveCount: number;
}

export const BrandKpiStrip = ({
  TotalBrands,
  TotalProducts,
  AverageProducts,
  ActiveCount,
}: BrandKpiStripProps) => (
  <section className="brands-kpi" aria-label="Métricas de marcas">
    <article className="brands-kpi__card brands-kpi__card--primary">
      <span className="brands-kpi__label">Marcas visibles</span>
      <strong className="brands-kpi__value">{TotalBrands}</strong>
      <span className="brands-kpi__meta">{ActiveCount} activas en catálogo</span>
    </article>

    <article className="brands-kpi__card brands-kpi__card--accent">
      <span className="brands-kpi__label">Productos vinculados</span>
      <strong className="brands-kpi__value">{TotalProducts}</strong>
      <span className="brands-kpi__meta">Inventario asociado</span>
    </article>

    <article className="brands-kpi__card brands-kpi__card--neutral">
      <span className="brands-kpi__label">Promedio por marca</span>
      <strong className="brands-kpi__value">{AverageProducts}</strong>
      <span className="brands-kpi__meta">Distribución del catálogo</span>
    </article>
  </section>
);
