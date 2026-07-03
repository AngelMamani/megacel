import type { Admin } from '../entities/Admin.ts';
import type { Unsubscribe } from '../types/CommonTypes.ts';

export interface IAdminRepository {
  subscribe(
    onChange: (admins: Admin[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  getByEmail(email: string): Promise<Admin | null>;
  getAll(): Promise<Admin[]>;
  isAdminEmail(email: string): Promise<boolean>;
  isPrimaryAdmin(email: string): Promise<boolean>;
  initializePrimaryAdmin(): Promise<void>;
  add(admin: Admin): Promise<void>;
  update(email: string, patch: Partial<Omit<Admin, 'id' | 'email'>>): Promise<void>;
  remove(email: string): Promise<void>;
  togglePrimary(email: string): Promise<void>;
}
