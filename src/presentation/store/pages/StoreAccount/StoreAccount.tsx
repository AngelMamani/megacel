import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useApplication } from '../../../providers/DependencyProvider.tsx';
import type { PlatformUser } from '../../../../domain/entities/PlatformUser.ts';
import './StoreAccount.css';
import '../../styles/Store.css';

export const StoreAccount = () => {
  const { user } = useAuth();
  const application = useApplication();
  const [profile, setProfile] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    region: '',
    documentNumber: '',
  });

  useEffect(() => {
    if (!user?.platformUserId) return;

    let active = true;
    void application.customer.getProfile
      .execute({ platformUserId: user.platformUserId })
      .then((data) => {
        if (!active) return;
        setProfile(data);
        if (data) {
          setForm({
            name: data.name || '',
            phone: data.phone?.replace('+51 ', '') || '',
            address: data.address || '',
            region: data.region || '',
            documentNumber: data.documentNumber || '',
          });
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [application.customer.getProfile, user?.platformUserId]);

  const HandleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.platformUserId || isSaving) return;

    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      await application.customer.updateProfile.execute({
        platformUserId: user.platformUserId,
        name: form.name.trim(),
        phone: form.phone.trim() ? `+51 ${form.phone.trim()}` : undefined,
        address: form.address.trim() || undefined,
        region: form.region.trim() || undefined,
        documentNumber: form.documentNumber.trim() || undefined,
      });
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="store-account">
        <div className="store-container store-empty">
          <h3>Cargando tu cuenta...</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="store-account">
      <div className="store-container store-account__grid">
        <aside className="store-account__summary">
          <span className="store-account__badge" aria-label="Cuenta verificada">
            <span className="store-account__badge-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" />
                <path d="M6 10.2 8.6 12.8 14.2 7.2" />
              </svg>
            </span>
            Cuenta verificada
          </span>
          <h1>Mi cuenta</h1>

          <div className="store-account__meta">
            <div>
              <span>Código</span>
              <strong>{user?.code}</strong>
            </div>
            <div>
              <span>Correo</span>
              <strong>{user?.email}</strong>
            </div>
            <div>
              <span>Rol</span>
              <strong>Cliente</strong>
            </div>
            {profile?.lastLogin && (
              <div>
                <span>Último acceso</span>
                <strong>{new Date(profile.lastLogin).toLocaleString('es-PE')}</strong>
              </div>
            )}
          </div>
        </aside>

        <form className="store-account__form" onSubmit={HandleSubmit}>
          <h2>Datos de contacto</h2>

          <label className="store-account__field">
            <span>Nombre completo</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => HandleChange('name', e.target.value)}
              required
            />
          </label>

          <label className="store-account__field">
            <span>Teléfono</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => HandleChange('phone', e.target.value)}
              placeholder="9XXXXXXXX"
            />
          </label>

          <label className="store-account__field">
            <span>Dirección</span>
            <input
              type="text"
              value={form.address}
              onChange={(e) => HandleChange('address', e.target.value)}
              placeholder="Calle, número, referencia"
            />
          </label>

          <label className="store-account__field">
            <span>Región / ciudad</span>
            <input
              type="text"
              value={form.region}
              onChange={(e) => HandleChange('region', e.target.value)}
            />
          </label>

          <label className="store-account__field">
            <span>Documento (DNI/CE)</span>
            <input
              type="text"
              value={form.documentNumber}
              onChange={(e) => HandleChange('documentNumber', e.target.value)}
            />
          </label>

          <button type="submit" className="store-btn store-btn--primary" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </section>
  );
};
