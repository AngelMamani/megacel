import type { SettingsPreferencesState } from '../types/SettingsPageTypes.ts';
import { IconSliders } from './SettingsIcons.tsx';

interface SettingsPreferencesFormProps {
  Preferences: SettingsPreferencesState;
  IsSaving: boolean;
  OnChange: (field: string, value: string | boolean) => void;
  OnSubmit: (event: React.FormEvent) => void;
}

export const SettingsPreferencesForm = ({
  Preferences,
  IsSaving,
  OnChange,
  OnSubmit,
}: SettingsPreferencesFormProps) => (
  <section className="settings-panel">
    <header className="settings-panel__header">
      <div className="settings-panel__icon settings-panel__icon--prefs" aria-hidden="true">
        <IconSliders />
      </div>
      <div>
        <h2 className="settings-panel__title">Preferencias</h2>
        <p className="settings-panel__subtitle">Idioma, zona horaria y notificaciones</p>
      </div>
    </header>

    <form className="settings-form" onSubmit={OnSubmit}>
      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="settings-language">
          Idioma
        </label>
        <select
          id="settings-language"
          className="settings-form__input"
          value={Preferences.language}
          onChange={(event) => OnChange('language', event.target.value)}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="settings-form__group">
        <label className="settings-form__label" htmlFor="settings-timezone">
          Zona horaria
        </label>
        <select
          id="settings-timezone"
          className="settings-form__input"
          value={Preferences.timezone}
          onChange={(event) => OnChange('timezone', event.target.value)}
        >
          <option value="America/Lima">Lima, Perú (GMT-5)</option>
        </select>
      </div>

      <div className="settings-toggle-list">
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={Preferences.emailNotifications}
            onChange={(event) => OnChange('emailNotifications', event.target.checked)}
          />
          <span className="settings-toggle__track" aria-hidden="true" />
          <span className="settings-toggle__content">
            <strong>Notificaciones por email</strong>
            <small>Recibe avisos importantes en tu correo</small>
          </span>
        </label>

        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={Preferences.pushNotifications}
            onChange={(event) => OnChange('pushNotifications', event.target.checked)}
          />
          <span className="settings-toggle__track" aria-hidden="true" />
          <span className="settings-toggle__content">
            <strong>Notificaciones push</strong>
            <small>Alertas en tiempo real en el navegador</small>
          </span>
        </label>
      </div>

      <div className="settings-form__footer">
        <button type="submit" className="settings-btn settings-btn--primary" disabled={IsSaving}>
          {IsSaving ? 'Guardando...' : 'Guardar preferencias'}
        </button>
      </div>
    </form>
  </section>
);
