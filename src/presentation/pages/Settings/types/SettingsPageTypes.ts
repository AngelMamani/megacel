import type { DocumentType } from '../../../../domain/value-objects/DocumentType.ts';

export interface SettingsProfileState {
  name: string;
  email: string;
  phone: string;
  code: string;
  documentType: DocumentType;
  documentNumber: string;
  address: string;
  region: string;
  avatar: File | string | null;
  avatarPreview: string;
}

export interface SettingsPreferencesState {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
