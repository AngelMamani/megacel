import { createContext } from 'react';
import type { CustomerAuthContextValue } from './CustomerAuthTypes.ts';

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);
