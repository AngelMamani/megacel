interface UsersKpiItem {
  Label: string;
  Value: string | number;
  Meta: string;
  Variant: 'primary' | 'accent' | 'warn' | 'neutral';
}

interface UsersKpiStripProps {
  Items: UsersKpiItem[];
}

export const UsersKpiStrip = ({ Items }: UsersKpiStripProps) => (
  <section className="users-kpi" aria-label="Métricas de usuarios">
    {Items.map((item) => (
      <article
        key={item.Label}
        className={`users-kpi__card users-kpi__card--${item.Variant}`}
      >
        <span className="users-kpi__label">{item.Label}</span>
        <strong className={`users-kpi__value${typeof item.Value === 'string' && item.Value.length > 8 ? ' users-kpi__value--compact' : ''}`}>
          {item.Value}
        </strong>
        <span className="users-kpi__meta">{item.Meta}</span>
      </article>
    ))}
  </section>
);
