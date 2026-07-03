import type { AdminProfile } from '../../../domain/entities/Admin.ts';

export interface UpdateAdminProfileInput {
  email: string;
  name: string;
  profile: AdminProfile;
}

export interface UpdateAdminProfileOutput {
  email: string;
}
