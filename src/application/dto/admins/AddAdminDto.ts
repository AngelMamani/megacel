import type { Admin } from '../../../domain/entities/Admin.ts';

export interface AddAdminInput {
  email: string;
  name: string;
  createdBy: string;
  isPrimary?: boolean;
}

export interface AddAdminOutput {
  admin: Admin;
}
