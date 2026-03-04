import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import './Settings.css';
import { useAuth } from '../../context/AuthContext';
import { COLLECTIONS } from '../../firebase/collections';
import { adminIdFromEmail } from '../../firebase/adminHelpers';
import { updateDocById } from '../../firebase/firestoreHelpers';
import { firestoreDb, firebaseAuth } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { uploadAdminAvatar } from '../../firebase/storageHelpers';
import { AdminManagementSection } from './AdminManagementSection';

export const Settings = () => {
  const { user } = useAuth();

  type AdminSettingsDoc = {
    email?: string;
    name?: string;
    createdAt?: string;
    createdBy?: string;
    isPrimary?: boolean;
    profile?: {
      phone?: string;
      code?: string;
      documentType?: 'DNI' | 'CE' | 'RUC';
      documentNumber?: string;
      address?: string;
      region?: string;
      avatarUrl?: string;
    };
    preferences?: {
      language?: string;
      timezone?: string;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
    };
    updatedAt?: string;
  };

  const [profile, setProfile] = useState({
    name: 'Administrador',
    email: '',
    phone: '',
    code: '',
    documentType: 'DNI' as 'DNI' | 'CE' | 'RUC',
    documentNumber: '',
    address: '',
    region: 'Madre de Dios',
    avatar: null as File | string | null,
    avatarPreview: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'es',
    timezone: 'America/Lima',
    emailNotifications: true,
    pushNotifications: true,
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    if (!user) return;

    const currentEmail = user.email.trim().toLowerCase();
    setProfile((prev) => ({
      ...prev,
      email: currentEmail,
      name: user.name || prev.name,
    }));

    let cancelled = false;
    (async () => {
      const adminId = adminIdFromEmail(currentEmail);
      try {
        const snap = await getDoc(doc(firestoreDb, COLLECTIONS.admins, adminId));
        if (!snap.exists() || cancelled) return;

        const data = snap.data() as AdminSettingsDoc;
        const docProfile = data.profile || {};
        const docPrefs = data.preferences || {};

        setProfile((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: currentEmail,
          phone: docProfile.phone || prev.phone,
          code: docProfile.code || prev.code || 'ADM-001',
          documentType: docProfile.documentType || prev.documentType,
          documentNumber: docProfile.documentNumber || prev.documentNumber,
          address: docProfile.address || prev.address,
          region: docProfile.region || prev.region,
          avatar: docProfile.avatarUrl || null,
          avatarPreview: docProfile.avatarUrl || '',
        }));

        setPreferences((prev) => ({
          ...prev,
          language: docPrefs.language || prev.language,
          timezone: docPrefs.timezone || prev.timezone,
          emailNotifications: docPrefs.emailNotifications ?? prev.emailNotifications,
          pushNotifications: docPrefs.pushNotifications ?? prev.pushNotifications,
        }));
      } catch (error) {
        console.error('Error loading settings from Firestore:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleProfileChange = (field: string, value: string | File | null) => {
    if (field === 'avatar' && value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          avatar: value,
          avatarPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(value);
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePreferencesChange = (field: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('No estás autenticado');
      return;
    }

    if (isSavingProfile) return;
    
    if (!profile.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!profile.documentNumber.trim()) {
      toast.error('El número de documento es requerido');
      return;
    }

    setIsSavingProfile(true);
    try {
      const adminId = adminIdFromEmail(user.email);
      let avatarUrl: string | undefined;

      if (profile.avatar instanceof File) {
        avatarUrl = await uploadAdminAvatar({ adminId, file: profile.avatar });
      } else if (typeof profile.avatar === 'string' && profile.avatar) {
        avatarUrl = profile.avatar;
      }

      await updateDocById<AdminSettingsDoc>(COLLECTIONS.admins, adminId, {
        name: profile.name.trim(),
        profile: {
          phone: profile.phone.trim() || undefined,
          code: profile.code.trim() || undefined,
          documentType: profile.documentType,
          documentNumber: profile.documentNumber.trim(),
          address: profile.address.trim() || undefined,
          region: profile.region.trim() || undefined,
          avatarUrl,
        },
        updatedAt: new Date().toISOString(),
      });

      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: profile.name.trim() }).catch(() => undefined);
      }

      if (avatarUrl) {
        setProfile((prev) => ({ ...prev, avatar: avatarUrl, avatarPreview: avatarUrl }));
      }

      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error saving profile to Firestore:', error);
      toast.error(error?.message || 'No se pudo guardar el perfil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('No estás autenticado');
      return;
    }
    if (isSavingPreferences) return;

    setIsSavingPreferences(true);
    try {
      const adminId = adminIdFromEmail(user.email);
      await updateDocById<AdminSettingsDoc>(COLLECTIONS.admins, adminId, {
        preferences: {
          language: preferences.language,
          timezone: preferences.timezone,
          emailNotifications: preferences.emailNotifications,
          pushNotifications: preferences.pushNotifications,
        },
        updatedAt: new Date().toISOString(),
      });

      toast.success('Preferencias guardadas correctamente');
    } catch (error: any) {
      console.error('Error saving preferences to Firestore:', error);
      toast.error(error?.message || 'No se pudieron guardar las preferencias');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-description">
            Ajusta la configuración de tu panel administrativo
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h2 className="settings-section-title">Perfil del Administrador</h2>
          <form className="settings-form" onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Foto de Perfil</label>
              <div className="avatar-upload-container">
                <div className="avatar-preview-wrapper">
                  {profile.avatarPreview ? (
                    <img src={profile.avatarPreview} alt="Avatar" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span>{profile.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProfileChange('avatar', file);
                  }}
                  className="avatar-input"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="btn btn-secondary">
                  Cambiar Foto
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.code}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={profile.email}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-input"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Documento</label>
                <select
                  className="form-input"
                  value={profile.documentType}
                  onChange={(e) => handleProfileChange('documentType', e.target.value as 'DNI' | 'CE' | 'RUC')}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Número de Documento</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.documentNumber}
                  onChange={(e) => handleProfileChange('documentNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Región</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.region}
                  onChange={(e) => handleProfileChange('region', e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Guardar Cambios</button>
          </form>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">Preferencias</h2>
          <form className="settings-form" onSubmit={handleSavePreferences}>
            <div className="form-group">
              <label className="form-label">Idioma</label>
              <select
                className="form-input"
                value={preferences.language}
                onChange={(e) => handlePreferencesChange('language', e.target.value)}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Zona Horaria</label>
              <select
                className="form-input"
                value={preferences.timezone}
                onChange={(e) => handlePreferencesChange('timezone', e.target.value)}
              >
                <option value="America/Lima">Lima, Perú (GMT-5)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferencesChange('emailNotifications', e.target.checked)}
                />
                <span>Notificaciones por email</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferencesChange('pushNotifications', e.target.checked)}
                />
                <span>Notificaciones push</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Guardar Cambios</button>
          </form>
        </div>

        <AdminManagementSection />
      </div>
    </div>
  );
};
