import type { ReactNode } from 'react';
import { useMemo, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthUser, AuthContextValue } from './AuthTypes';
import { firebaseAuth } from '../firebase/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { isAdminEmail } from '../firebase/adminHelpers';

const AUTH_STORAGE_KEY = 'mega_cel_admin_auth';
const AUTH_ERROR_STORAGE_KEY = 'mega_cel_admin_auth_error';
const ADMIN_EMAIL = 'amamanim@unamad.edu.pe';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as AuthUser | null;
      if (parsed && parsed.role === 'admin') {
        return parsed;
      }
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('Error loading auth state:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase() || '';
        try {
          const isPrimaryAdmin = email === ADMIN_EMAIL.toLowerCase();
          const isAdmin = isPrimaryAdmin ? true : await isAdminEmail(email);
          if (isAdmin) {
            const authUser: AuthUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Administrador',
              email: firebaseUser.email || ADMIN_EMAIL,
              role: 'admin',
            };
            setUser(authUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          } else {
            sessionStorage.setItem(
              AUTH_ERROR_STORAGE_KEY,
              `El correo ${email} no está autorizado para acceder al panel administrativo.`
            );
            await signOut(firebaseAuth);
            setUser(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } catch (error) {
          sessionStorage.setItem(
            AUTH_ERROR_STORAGE_KEY,
            'No se pudo validar el acceso del usuario. Revisa la configuración de Firebase (Auth/Firestore Rules).'
          );
          console.error('Error verificando admin:', error);
          await signOut(firebaseAuth);
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });

    return () => unsubscribe();
  }, []);

  const login: AuthContextValue['login'] = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        normalizedEmail,
        password
      );
      const firebaseUser = userCredential.user;

      const firebaseEmail = firebaseUser.email?.toLowerCase() || '';
      const isPrimaryAdmin = firebaseEmail === ADMIN_EMAIL.toLowerCase();
      const isAdmin = isPrimaryAdmin ? true : await isAdminEmail(firebaseEmail);

      if (!isAdmin) {
        await signOut(firebaseAuth);
        sessionStorage.setItem(
          AUTH_ERROR_STORAGE_KEY,
          `El correo ${firebaseEmail} no está autorizado para acceder al panel administrativo.`
        );
        throw new Error(
          `El correo ${firebaseEmail} no está autorizado para acceder al panel administrativo. Contacta al administrador principal.`
        );
      }

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Administrador',
        email: firebaseUser.email || ADMIN_EMAIL,
        role: 'admin',
      };

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } catch (error: any) {
      if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
        throw new Error('Credenciales inválidas');
      }
      if (error?.code === 'auth/invalid-credential') {
        throw new Error('Credenciales inválidas');
      }
      if (error?.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Inicio con correo/contraseña no está habilitado en Firebase Auth. Habilítalo en Firebase Console > Authentication > Sign-in method.'
        );
      }
      if (error?.code === 'auth/network-request-failed') {
        throw new Error('Error de red. Revisa tu conexión e intenta nuevamente.');
      }
      throw new Error(error?.message || 'Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  const loginWithGoogle: AuthContextValue['loginWithGoogle'] = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const email = result.user.email?.toLowerCase() || '';

      const isPrimaryAdmin = email === ADMIN_EMAIL.toLowerCase();
      const isAdmin = isPrimaryAdmin ? true : await isAdminEmail(email);
      if (!isAdmin) {
        await signOut(firebaseAuth);
        sessionStorage.setItem(
          AUTH_ERROR_STORAGE_KEY,
          `El correo ${email} no está autorizado para acceder al panel administrativo.`
        );
        throw new Error(
          `El correo ${email} no está autorizado para acceder al panel administrativo. Contacta al administrador principal.`
        );
      }

      const authUser: AuthUser = {
        id: result.user.uid,
        name: result.user.displayName || 'Administrador',
        email: result.user.email || ADMIN_EMAIL,
        role: 'admin',
      };

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } catch (error: any) {
      console.error('Error iniciando Google Sign-In:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Se cerró la ventana de Google. Intenta nuevamente.');
      }
      if (error?.code === 'auth/cancelled-popup-request') {
        throw new Error('Solicitud cancelada. Intenta nuevamente.');
      }
      if (error?.code === 'auth/popup-blocked') {
        throw new Error('El navegador bloqueó la ventana emergente. Habilita popups e intenta nuevamente.');
      }
      if (error?.code === 'auth/unauthorized-domain') {
        throw new Error(
          'Dominio no autorizado para Google Sign-In. Revisa Firebase Console > Authentication > Settings > Authorized domains.'
        );
      }
      throw new Error(error?.message || 'Error al iniciar sesión con Google. Intenta nuevamente.');
    }
  };

  const logout: AuthContextValue['logout'] = async () => {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error('Error al cerrar sesión en Firebase:', error);
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

