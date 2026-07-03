import { IconSettings } from './SettingsIcons.tsx';

export const SettingsPageHeader = () => (
  <header className="settings-hero">
    <div className="settings-hero__mesh" aria-hidden="true">
      <span className="settings-hero__blob settings-hero__blob--1" />
      <span className="settings-hero__blob settings-hero__blob--2" />
      <span className="settings-hero__blob settings-hero__blob--3" />
    </div>

    <div className="settings-hero__content">
      <div className="settings-hero__badge">
        <IconSettings size={16} />
        <span>Cuenta · Configuración</span>
      </div>
      <h1 className="settings-hero__title">Centro de Configuración</h1>
      <p className="settings-hero__subtitle">
        Administra tu perfil, datos de contacto y preferencias del panel MEGA CEL.
      </p>
    </div>
  </header>
);
