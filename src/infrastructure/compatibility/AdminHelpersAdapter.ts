import { adminIdFromEmail } from '../../domain/services/AdminIdGenerator.ts';
import { getInfrastructure } from '../index.ts';
import type { Admin } from '../../domain/entities/Admin.ts';

export type { Admin };
export { adminIdFromEmail };

const infra = () => getInfrastructure().repositories.admin;

export async function initializePrimaryAdmin(): Promise<void> {
  return infra().initializePrimaryAdmin();
}

export async function isAdminEmail(email: string): Promise<boolean> {
  return infra().isAdminEmail(email);
}

export async function isPrimaryAdmin(email: string): Promise<boolean> {
  return infra().isPrimaryAdmin(email);
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  return infra().getByEmail(email);
}

export async function getAllAdmins(): Promise<Admin[]> {
  return infra().getAll();
}

export async function addAdmin(
  email: string,
  name: string,
  createdBy: string,
  isPrimary = false
): Promise<void> {
  await getInfrastructure().application.admins.add.execute({
    email,
    name,
    createdBy,
    isPrimary,
  });
}

export async function removeAdmin(email: string): Promise<void> {
  await getInfrastructure().application.admins.remove.execute({ email });
}

export async function togglePrimaryAdmin(email: string): Promise<void> {
  await getInfrastructure().application.admins.togglePrimary.execute({ email });
}
