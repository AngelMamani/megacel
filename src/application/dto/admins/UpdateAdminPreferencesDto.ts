import type { AdminPreferences } from '../../../domain/entities/Admin.ts';

export interface UpdateAdminPreferencesInput {
  email: string;
  preferences: AdminPreferences;
}

export interface UpdateAdminPreferencesOutput {
  email: string;
}
