import { IconShield, IconUsers } from './UserIcons.tsx';

interface UsersHubProps {
  OnSelectAdmins: () => void;
  OnSelectClients: () => void;
}

export const UsersHub = ({ OnSelectAdmins, OnSelectClients }: UsersHubProps) => (
  <div className="users-hub">
    <header className="users-hub__hero users-hero">
      <div className="users-hero__mesh" aria-hidden="true">
        <span className="users-hero__blob users-hero__blob--1" />
        <span className="users-hero__blob users-hero__blob--2" />
        <span className="users-hero__blob users-hero__blob--3" />
      </div>
      <div className="users-hero__content">
        <div className="users-hero__badge">
          <IconUsers size={16} />
          <span>Personas · Usuarios</span>
        </div>
        <h1 className="users-hero__title">Centro de gestión</h1>
        <p className="users-hero__subtitle">
          Administra clientes de la tienda y el equipo que accede al panel MEGA CEL.
        </p>
      </div>
    </header>

    <div className="users-hub__grid">
      <button type="button" className="users-hub-card users-hub-card--admin" onClick={OnSelectAdmins}>
        <span className="users-hub-card__icon" aria-hidden>
          <IconShield size={22} />
        </span>
        <span className="users-hub-card__title">Gestión de administradores</span>
      </button>

      <button type="button" className="users-hub-card" onClick={OnSelectClients}>
        <span className="users-hub-card__icon" aria-hidden>
          <IconUsers size={22} />
        </span>
        <span className="users-hub-card__title">Gestión de clientes</span>
      </button>
    </div>
  </div>
);
