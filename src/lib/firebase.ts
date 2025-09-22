// firebase.ts

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'placeholder.appspot.com',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:123456789:web:placeholder'
};

// Initialize Firebase app (singleton)
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});
export const storage = getStorage(
  app,
  firebaseConfig.storageBucket
    ? `gs://${firebaseConfig.storageBucket}`
    : undefined
);

// Connect to emulators only in development
if (
  process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined'
) {
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || '127.0.0.1';

  // Auth emulator
  connectAuthEmulator(auth, `http://${host}:9199`, {
    disableWarnings: true
  });
  console.info(`[Firebase] Connected Auth emulator at ${host}:9199`);

  // Firestore emulator
  connectFirestoreEmulator(db, host, 8080);
  console.info(`[Firebase] Connected Firestore emulator at ${host}:8080`);

  // Storage emulator
  connectStorageEmulator(storage, host, 9199);
  console.info(`[Firebase] Connected Storage emulator at ${host}:9199`);
}

export default app;
