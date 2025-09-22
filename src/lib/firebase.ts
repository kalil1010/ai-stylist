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

// Toggle emulators explicitly so production never leaks localhost URLs.
const emulatorSetting = process.env.NEXT_PUBLIC_USE_EMULATORS?.toLowerCase();
const shouldUseEmulators =
  process.env.NODE_ENV !== 'production' &&
  emulatorSetting !== 'false' &&
  emulatorSetting !== '0';

if (shouldUseEmulators) {
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || '127.0.0.1';
  const authPort = Number(process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT || 9099);
  const firestorePort = Number(
    process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || 8080
  );
  const storagePort = Number(
    process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || 9199
  );

  const globalScope = globalThis as typeof globalThis & {
    __FIREBASE_AUTH_EMULATOR__?: boolean;
    __FIREBASE_FIRESTORE_EMULATOR__?: boolean;
    __FIREBASE_STORAGE_EMULATOR__?: boolean;
  };

  if (!globalScope.__FIREBASE_FIRESTORE_EMULATOR__) {
    connectFirestoreEmulator(db, host, firestorePort);
    globalScope.__FIREBASE_FIRESTORE_EMULATOR__ = true;
    console.info(
      `[Firebase] Connected Firestore emulator at ${host}:${firestorePort}`
    );
  }

  if (typeof window !== 'undefined') {
    if (!globalScope.__FIREBASE_AUTH_EMULATOR__) {
      connectAuthEmulator(auth, `http://${host}:${authPort}`, {
        disableWarnings: true
      });
      globalScope.__FIREBASE_AUTH_EMULATOR__ = true;
      console.info(
        `[Firebase] Connected Auth emulator at ${host}:${authPort}`
      );
    }

    if (!globalScope.__FIREBASE_STORAGE_EMULATOR__) {
      connectStorageEmulator(storage, host, storagePort);
      globalScope.__FIREBASE_STORAGE_EMULATOR__ = true;
      console.info(
        `[Firebase] Connected Storage emulator at ${host}:${storagePort}`
      );
    }
  }
}

export default app;
