const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

export function assertValidEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new Error('El correo electrónico no es válido');
  }
}
