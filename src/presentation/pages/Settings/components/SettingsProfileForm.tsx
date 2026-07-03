import type { SettingsProfileState } from '../types/SettingsPageTypes.ts';
import { IconUser } from './SettingsIcons.tsx';

interface SettingsProfileFormProps {
  Profile: SettingsProfileState;
  IsSaving: boolean;
  OnChange: (field: string, value: string | File | null) => void;
  OnSubmit: (event: React.FormEvent) => void;
}

export const SettingsProfileForm = ({
  Profile,
  IsSaving,
  OnChange,
  OnSubmit,
}: SettingsProfileFormProps) => (
  <section className="settings-panel">
    <header className="settings-panel__header">
      <div className="settings-panel__icon" aria-hidden="true">
        <IconUser />
      </div>
      <div>
        <h2 className="settings-panel__title">Perfil del administrador</h2>
        <p className="settings-panel__subtitle">Datos personales y foto de tu cuenta</p>
      </div>
    </header>

    <form className="settings-form" onSubmit={OnSubmit}>
      <div className="settings-form__group settings-form__group--avatar">
        <label className="settings-form__label">Foto de perfil</label>
        <div className="settings-avatar">
          <div className="settings-avatar__preview">
            {Profile.avatarPreview ? (
              <img src={Profile.avatarPreview} alt="Avatar" className="settings-avatar__image" />
            ) : (
              <span className="settings-avatar__initial">
                {Profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="settings-avatar__actions">
            <input
              type="file"
              accept="image/*"
              id="settings-avatar-upload"
              className="settings-avatar__input"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) OnChange('avatar', file);
              }}
            />
            <label htmlFor="settings-avatar-upload" className="settings-btn settings-btn--ghost">
              Cambiar foto
            </label>
            <p className="settings-form__hint">JPG o PNG · recomendado 400×400 px</p>
          </div>
        </div>
      </div>

      <div className="settings-form__row">
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-code">
            Código
          </label>
          <input id="settings-code" type="text" className="settings-form__input" value={Profile.code} disabled />
        </div>
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-name">
            Nombre completo
          </label>
          <input
            id="settings-name"
            type="text"
            className="settings-form__input"
            value={Profile.name}
            onChange={(event) => OnChange('name', event.target.value)}
            required
          />
        </div>
      </div>

      <div className="settings-form__row">
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-email">
            Email
          </label>
          <input
            id="settings-email"
            type="email"
            className="settings-form__input"
            value={Profile.email}
            disabled
          />
        </div>
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-phone">
            Teléfono
          </label>
          <input
            id="settings-phone"
            type="tel"
            className="settings-form__input"
            value={Profile.phone}
            onChange={(event) => OnChange('phone', event.target.value)}
            required
          />
        </div>
      </div>

      <div className="settings-form__row">
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-doc-type">
            Tipo de documento
          </label>
          <select
            id="settings-doc-type"
            className="settings-form__input"
            value={Profile.documentType}
            onChange={(event) => OnChange('documentType', event.target.value)}
          >
            <option value="DNI">DNI</option>
            <option value="CE">CE</option>
            <option value="RUC">RUC</option>
          </select>
        </div>
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-doc-number">
            Número de documento
          </label>
          <input
            id="settings-doc-number"
            type="text"
            className="settings-form__input"
            value={Profile.documentNumber}
            onChange={(event) => OnChange('documentNumber', event.target.value)}
            required
          />
        </div>
      </div>

      <div className="settings-form__row">
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-address">
            Dirección
          </label>
          <input
            id="settings-address"
            type="text"
            className="settings-form__input"
            value={Profile.address}
            onChange={(event) => OnChange('address', event.target.value)}
          />
        </div>
        <div className="settings-form__group">
          <label className="settings-form__label" htmlFor="settings-region">
            Región
          </label>
          <input
            id="settings-region"
            type="text"
            className="settings-form__input"
            value={Profile.region}
            onChange={(event) => OnChange('region', event.target.value)}
          />
        </div>
      </div>

      <div className="settings-form__footer">
        <button type="submit" className="settings-btn settings-btn--primary" disabled={IsSaving}>
          {IsSaving ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </div>
    </form>
  </section>
);
