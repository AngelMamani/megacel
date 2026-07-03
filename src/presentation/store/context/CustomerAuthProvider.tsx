import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CustomerAuthContext } from './CustomerAuthContext.tsx';
import type { CustomerAuthContextValue, CustomerAuthUser } from './CustomerAuthTypes.ts';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { CustomerSessionOutput } from '../../../application/dto/customer/CustomerAuthDto.ts';

const CUSTOMER_AUTH_STORAGE_KEY = 'mega_cel_customer_auth';
const CUSTOMER_AUTH_ERROR_KEY = 'mega_cel_customer_auth_error';

const MapSessionToUser = (session: CustomerSessionOutput): CustomerAuthUser => ({
  authUid: session.authUid,
  platformUserId: session.platformUserId,
  code: session.code,
  name: session.name,
  email: session.email,
  role: 'cliente',
});

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const { repositories, application } = useInfrastructure();
  const [user, setUser] = useState<CustomerAuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as CustomerAuthUser | null;
      if (parsed?.role === 'cliente') return parsed;
      localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
      return null;
    } catch {
      localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = repositories.auth.onSessionChange(async (session) => {
      if (!session) {
        setUser(null);
        localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
        setIsLoading(false);
        return;
      }

      try {
        const resolved = await application.customer.resolveSession.execute({
          authUid: session.id,
          email: session.email,
          name: session.name,
        });

        if (resolved) {
          const authUser = MapSessionToUser(resolved);
          setUser(authUser);
          localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, JSON.stringify(authUser));
        } else {
          sessionStorage.setItem(
            CUSTOMER_AUTH_ERROR_KEY,
            `La cuenta ${session.email} no está habilitada como cliente de MEGA CEL.`
          );
          await repositories.auth.logout();
          setUser(null);
          localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error resolviendo sesión de cliente:', error);
        await repositories.auth.logout();
        setUser(null);
        localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [application.customer.resolveSession, repositories.auth]);

  const persistUser = (session: CustomerSessionOutput) => {
    const authUser = MapSessionToUser(session);
    setUser(authUser);
    localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, JSON.stringify(authUser));
  };

  const login: CustomerAuthContextValue['login'] = async (email, password) => {
    const result = await application.customer.loginWithEmail.execute({ email, password });
    persistUser(result);
  };

  const loginWithGoogle: CustomerAuthContextValue['loginWithGoogle'] = async () => {
    const result = await application.customer.loginWithGoogle.execute();
    persistUser(result);
  };

  const register: CustomerAuthContextValue['register'] = async (name, email, password, phone) => {
    const result = await application.customer.register.execute({ name, email, password, phone });
    persistUser(result);
  };

  const logout: CustomerAuthContextValue['logout'] = async () => {
    try {
      await application.auth.logout.execute();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setUser(null);
    localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
  };

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};
