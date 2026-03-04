import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function getRequiredEnv(key: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (!value) {
    throw new Error(`Falta variable de entorno: ${key}`);
  }
  return value;
}

const projectId = getRequiredEnv('VITE_FIREBASE_PROJECT_ID');
const authDomainFromEnv = import.meta.env
  .VITE_FIREBASE_AUTH_DOMAIN as unknown as string | undefined;

export const firebaseConfig = {
  apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: authDomainFromEnv?.trim() || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);


