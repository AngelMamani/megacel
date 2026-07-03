import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import './Settings.css';
import { useAuth } from '../../context/AuthContext';
import { useApplication, useInfrastructure } from '../../providers/DependencyProvider.tsx';
import { adminIdFromEmail } from '../../../domain/services/AdminIdGenerator.ts';
import type { DocumentType } from '../../../domain/value-objects/DocumentType.ts';
import { uploadAdminAvatar } from '../../../infrastructure/index.ts';
import { SettingsPageHeader } from './components/SettingsPageHeader.tsx';
import { SettingsPreferencesForm } from './components/SettingsPreferencesForm.tsx';
import { SettingsProfileForm } from './components/SettingsProfileForm.tsx';
import type { SettingsPreferencesState, SettingsProfileState } from './types/SettingsPageTypes.ts';

export const Settings = () => {
  const { user } = useAuth();
  const { repositories } = useInfrastructure();
  const application = useApplication();

  const [profile, setProfile] = useState<SettingsProfileState>({
    name: 'Administrador',
    email: '',
    phone: '',
    code: '',
    documentType: 'DNI',
    documentNumber: '',
    address: '',
    region: 'Madre de Dios',
    avatar: null,
    avatarPreview: '',
  });

  const [preferences, setPreferences] = useState<SettingsPreferencesState>({
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
      try {
        const admin = await repositories.admin.getByEmail(currentEmail);
        if (!admin || cancelled) return;

        const docProfile = admin.profile || {};
        const docPrefs = admin.preferences || {};

        setProfile((prev) => ({
          ...prev,
          name: admin.name || prev.name,
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
  }, [user, repositories.admin]);

  const handleProfileChange = (field: string, value: string | File | null) => {
    if (field === 'avatar' && value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          avatar: value,
          avatarPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(value);
      return;
    }

    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field: string, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();

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

      await application.admins.updateProfile.execute({
        email: user.email,
        name: profile.name.trim(),
        profile: {
          phone: profile.phone.trim() || undefined,
          code: profile.code.trim() || undefined,
          documentType: profile.documentType as DocumentType,
          documentNumber: profile.documentNumber.trim(),
          address: profile.address.trim() || undefined,
          region: profile.region.trim() || undefined,
          avatarUrl,
        },
      });

      if (avatarUrl) {
        setProfile((prev) => ({ ...prev, avatar: avatarUrl, avatarPreview: avatarUrl }));
      }

      toast.success('Perfil actualizado correctamente');
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error saving profile:', error);
      toast.error(err?.message || 'No se pudo guardar el perfil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('No estás autenticado');
      return;
    }
    if (isSavingPreferences) return;

    setIsSavingPreferences(true);
    try {
      await application.admins.updatePreferences.execute({
        email: user.email,
        preferences: {
          language: preferences.language,
          timezone: preferences.timezone,
          emailNotifications: preferences.emailNotifications,
          pushNotifications: preferences.pushNotifications,
        },
      });

      toast.success('Preferencias guardadas correctamente');
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Error saving preferences:', error);
      toast.error(err?.message || 'No se pudieron guardar las preferencias');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="settings-page">
      <SettingsPageHeader />

      <div className="settings-layout">
        <SettingsProfileForm
          Profile={profile}
          IsSaving={isSavingProfile}
          OnChange={handleProfileChange}
          OnSubmit={handleSaveProfile}
        />

        <SettingsPreferencesForm
          Preferences={preferences}
          IsSaving={isSavingPreferences}
          OnChange={handlePreferencesChange}
          OnSubmit={handleSavePreferences}
        />
      </div>
    </div>
  );
};
