import { IconOrders } from './OrderIcons.tsx';

export const OrderPageHeader = () => (
  <header className="orders-hero">
    <div className="orders-hero__mesh" aria-hidden="true">
      <span className="orders-hero__blob orders-hero__blob--1" />
      <span className="orders-hero__blob orders-hero__blob--2" />
      <span className="orders-hero__blob orders-hero__blob--3" />
    </div>

    <div className="orders-hero__content">
      <div className="orders-hero__badge">
        <IconOrders size={16} />
        <span>Operaciones · Pedidos</span>
      </div>
      <h1 className="orders-hero__title">Centro de Pedidos</h1>
      <p className="orders-hero__subtitle">
        Revisa pagos, actualiza estados y gestiona los pedidos online de MEGA CEL en tiempo real.
      </p>
    </div>
  </header>
);
