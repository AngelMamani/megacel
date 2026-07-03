import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import type { IAuthRepository, AuthSession } from '../../../domain/repositories/IAuthRepository.ts';
import { firebaseAuth, secondaryFirebaseAuth } from '../config/FirebaseConfig.ts';
import { PRIMARY_ADMIN_EMAIL } from '../../../domain/constants/AdminConstants.ts';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function mapFirebaseUserToSession(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
}): AuthSession {
  return {
    id: user.uid,
    name: user.displayName || 'Usuario',
    email: user.email || PRIMARY_ADMIN_EMAIL,
  };
}

function mapAuthError(error: unknown, fallback: string): Error {
  const firebaseError = error as { code?: string; message?: string };

  if (firebaseError?.code === 'auth/user-not-found' || firebaseError?.code === 'auth/wrong-password') {
    return new Error('Credenciales inválidas');
  }
  if (firebaseError?.code === 'auth/invalid-credential') {
    return new Error('Credenciales inválidas');
  }
  if (firebaseError?.code === 'auth/operation-not-allowed') {
    return new Error(
      'Inicio con correo/contraseña no está habilitado en Firebase Auth. Habilítalo en Firebase Console > Authentication > Sign-in method.'
    );
  }
  if (firebaseError?.code === 'auth/email-already-in-use') {
    return new Error('Este correo ya está registrado en Firebase Auth.');
  }
  if (firebaseError?.code === 'auth/weak-password') {
    return new Error('La contraseña debe tener al menos 6 caracteres.');
  }
  if (firebaseError?.code === 'auth/network-request-failed') {
    return new Error('Error de red. Revisa tu conexión e intenta nuevamente.');
  }
  if (firebaseError?.code === 'auth/popup-closed-by-user') {
    return new Error('Se cerró la ventana de Google. Intenta nuevamente.');
  }
  if (firebaseError?.code === 'auth/cancelled-popup-request') {
    return new Error('Solicitud cancelada. Intenta nuevamente.');
  }
  if (firebaseError?.code === 'auth/popup-blocked') {
    return new Error('El navegador bloqueó la ventana emergente. Habilita popups e intenta nuevamente.');
  }
  if (firebaseError?.code === 'auth/unauthorized-domain') {
    return new Error(
      'Dominio no autorizado para Google Sign-In. Revisa Firebase Console > Authentication > Settings > Authorized domains.'
    );
  }

  return new Error(firebaseError?.message || fallback);
}

export function createFirebaseAuthRepository(): IAuthRepository {
  return {
    async loginWithEmail(email, password) {
      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        return mapFirebaseUserToSession(credential.user);
      } catch (error) {
        throw mapAuthError(error, 'Error al iniciar sesión. Intenta nuevamente.');
      }
    },

    async loginWithGoogle() {
      try {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        return mapFirebaseUserToSession(result.user);
      } catch (error) {
        throw mapAuthError(error, 'Error al iniciar sesión con Google. Intenta nuevamente.');
      }
    },

    async registerWithEmail(email, password, displayName) {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
        }
        return mapFirebaseUserToSession({
          uid: credential.user.uid,
          displayName: displayName.trim() || credential.user.displayName,
          email: credential.user.email,
        });
      } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError?.code === 'auth/email-already-in-use') {
          throw new Error('Este correo ya está registrado. Inicia sesión en su lugar.');
        }
        throw mapAuthError(error, 'No se pudo crear la cuenta. Intenta nuevamente.');
      }
    },

    async createUserWithEmail(email, password, displayName) {
      try {
        const credential = await createUserWithEmailAndPassword(
          secondaryFirebaseAuth,
          email,
          password
        );
        if (displayName.trim()) {
          await updateProfile(credential.user, { displayName: displayName.trim() });
        }
        const session = mapFirebaseUserToSession({
          uid: credential.user.uid,
          displayName: displayName.trim() || credential.user.displayName,
          email: credential.user.email,
        });
        await signOut(secondaryFirebaseAuth);
        return session;
      } catch (error) {
        try {
          await signOut(secondaryFirebaseAuth);
        } catch {
          // Ignorar error al limpiar sesión secundaria
        }
        throw mapAuthError(error, 'No se pudo crear la cuenta de acceso. Intenta nuevamente.');
      }
    },

    async logout() {
      await signOut(firebaseAuth);
    },

    getCurrentSession() {
      const user = firebaseAuth.currentUser;
      if (!user) return null;
      return mapFirebaseUserToSession(user);
    },

    async updateDisplayName(name) {
      const user = firebaseAuth.currentUser;
      if (!user) return;
      await updateProfile(user, { displayName: name.trim() });
    },

    onSessionChange(callback) {
      return onAuthStateChanged(firebaseAuth, (user) => {
        callback(user ? mapFirebaseUserToSession(user) : null);
      });
    },
  };
}
