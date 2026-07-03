import { normalizeEmail } from '../value-objects/Email.ts';

/** Deriva el ID de documento Firestore a partir del email del admin. */
export function adminIdFromEmail(email: string): string {
  const normalizedEmail = normalizeEmail(email);
  return normalizedEmail.replace(/[^a-z0-9]/g, '-');
}
