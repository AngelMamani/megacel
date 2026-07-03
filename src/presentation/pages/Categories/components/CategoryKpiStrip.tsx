interface CategoryKpiStripProps {
  TotalCategories: number;
  TotalProducts: number;
  AverageProducts: number;
  ActiveCount: number;
}

export const CategoryKpiStrip = ({
  TotalCategories,
  TotalProducts,
  AverageProducts,
  ActiveCount,
}: CategoryKpiStripProps) => (
  <section className="categories-kpi" aria-label="Métricas de categorías">
    <article className="categories-kpi__card categories-kpi__card--primary">
      <span className="categories-kpi__label">Categorías visibles</span>
      <strong className="categories-kpi__value">{TotalCategories}</strong>
      <span className="categories-kpi__meta">{ActiveCount} activas en catálogo</span>
    </article>

    <article className="categories-kpi__card categories-kpi__card--accent">
      <span className="categories-kpi__label">Productos vinculados</span>
      <strong className="categories-kpi__value">{TotalProducts}</strong>
      <span className="categories-kpi__meta">Inventario asociado</span>
    </article>

    <article className="categories-kpi__card categories-kpi__card--neutral">
      <span className="categories-kpi__label">Promedio por categoría</span>
      <strong className="categories-kpi__value">{AverageProducts}</strong>
      <span className="categories-kpi__meta">Distribución del catálogo</span>
    </article>
  </section>
);
