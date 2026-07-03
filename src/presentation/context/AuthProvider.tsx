import type { ReactNode } from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext.tsx';
import type { AuthContextValue, AuthUser } from './AuthTypes.ts';
import { MapUnifiedAuthToUser } from './AuthTypes.ts';
import { useInfrastructure } from '../providers/DependencyProvider.tsx';
import type { CustomerSessionOutput } from '../../application/dto/customer/CustomerAuthDto.ts';

const AUTH_STORAGE_KEY = 'mega_cel_auth';
const AUTH_ERROR_STORAGE_KEY = 'mega_cel_auth_error';

const ReadStoredUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AuthUser | null;
    if (parsed && (parsed.role === 'admin' || parsed.role === 'cliente')) return parsed;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error loading auth state:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const MapCustomerRegisterToUser = (session: CustomerSessionOutput): AuthUser => ({
  id: session.authUid,
  name: session.name,
  email: session.email,
  role: 'cliente',
  platformUserId: session.platformUserId,
  code: session.code,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { repositories, application } = useInfrastructure();
  const initialUser = ReadStoredUser();

  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const resolvedSessionUidRef = useRef<string | null>(initialUser?.id ?? null);
  const skipSessionResolveRef = useRef(false);

  const PersistUser = (authUser: AuthUser) => {
    resolvedSessionUidRef.current = authUser.id;
    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = repositories.auth.onSessionChange(async (session) => {
      if (!session) {
        resolvedSessionUidRef.current = null;
        skipSessionResolveRef.current = false;
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsLoading(false);
        return;
      }

      if (skipSessionResolveRef.current && resolvedSessionUidRef.current === session.id) {
        skipSessionResolveRef.current = false;
        setIsLoading(false);
        return;
      }

      if (resolvedSessionUidRef.current === session.id && user?.id === session.id) {
        setIsLoading(false);
        return;
      }

      try {
        const resolved = await application.auth.resolveSession.execute({
          authUid: session.id,
          email: session.email,
          name: session.name,
        });

        if (resolved) {
          PersistUser(MapUnifiedAuthToUser(resolved));
        } else {
          sessionStorage.setItem(
            AUTH_ERROR_STORAGE_KEY,
            `La cuenta ${session.email} no está autorizada en MEGA CEL.`
          );
          await repositories.auth.logout();
          resolvedSessionUidRef.current = null;
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        sessionStorage.setItem(
          AUTH_ERROR_STORAGE_KEY,
          'No se pudo validar tu sesión. Intenta nuevamente.'
        );
        await repositories.auth.logout();
        resolvedSessionUidRef.current = null;
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [application.auth.resolveSession, repositories.auth, user?.id]);

  const login: AuthContextValue['login'] = async (email, password) => {
    skipSessionResolveRef.current = true;
    const result = await application.auth.loginWithEmail.execute({ email, password });
    const authUser = MapUnifiedAuthToUser(result);
    PersistUser(authUser);
    return authUser;
  };

  const loginWithGoogle: AuthContextValue['loginWithGoogle'] = async () => {
    skipSessionResolveRef.current = true;
    const result = await application.auth.loginWithGoogle.execute();
    const authUser = MapUnifiedAuthToUser(result);
    PersistUser(authUser);
    return authUser;
  };

  const register: AuthContextValue['register'] = async (name, email, password, phone) => {
    skipSessionResolveRef.current = true;
    const result = await application.customer.register.execute({ name, email, password, phone });
    const authUser = MapCustomerRegisterToUser(result);
    PersistUser(authUser);
    return authUser;
  };

  const logout: AuthContextValue['logout'] = async () => {
    try {
      await application.auth.logout.execute();
    } catch (error) {
      console.error('Error al cerrar sesión en Firebase:', error);
    }
    resolvedSessionUidRef.current = null;
    skipSessionResolveRef.current = false;
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isAdmin: user?.role === 'admin',
      isCliente: user?.role === 'cliente',
      login,
      loginWithGoogle,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
