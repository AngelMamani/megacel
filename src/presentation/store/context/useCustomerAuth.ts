import { useContext } from 'react';
import { CustomerAuthContext } from './CustomerAuthContext.tsx';
import type { CustomerAuthContextValue } from './CustomerAuthTypes.ts';

export function useCustomerAuth(): CustomerAuthContextValue {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth debe usarse dentro de CustomerAuthProvider');
  }
  return context;
}
