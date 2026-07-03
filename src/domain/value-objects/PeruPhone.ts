export const PERU_PHONE_LENGTH = 9;

export function NormalizePeruPhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, PERU_PHONE_LENGTH);
}

export function ValidatePeruPhone(phone: string): string | null {
  const digits = NormalizePeruPhoneInput(phone);

  if (!digits) {
    return 'Ingresa tu número de celular';
  }

  if (digits.length !== PERU_PHONE_LENGTH) {
    return `El celular debe tener ${PERU_PHONE_LENGTH} dígitos`;
  }

  if (!digits.startsWith('9')) {
    return 'El celular debe comenzar con 9';
  }

  return null;
}
