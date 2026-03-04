import { signInAnonymously } from 'firebase/auth';
import { firebaseAuth } from './firebase';

export async function ensureDevAnonymousAuth(): Promise<boolean> {
  if (!import.meta.env.DEV) return false;
  if (firebaseAuth.currentUser) return true;

  try {
    await signInAnonymously(firebaseAuth);
    return true;
  } catch (error: any) {
    if (error?.code === 'auth/admin-restricted-operation') {
      console.warn(
        'Autenticación anónima no habilitada en Firebase.\n' +
        'Para habilitarla:\n' +
        '1. Ve a Firebase Console > Authentication > Sign-in method\n' +
        '2. Habilita "Anonymous"\n' +
        '3. Guarda los cambios\n\n' +
        'Esto es necesario para subir imágenes a Storage.'
      );
    } else {
      console.error('Error en autenticación anónima:', error);
    }
    return false;
  }
}


