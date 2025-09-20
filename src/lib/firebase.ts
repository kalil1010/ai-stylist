import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:placeholder',
}

// Initialize Firebase with error handling
let app: any = null
let auth: any = null
let db: any = null
let storage: any = null

try {
  if (firebaseConfig.apiKey !== 'placeholder') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    // Auto-detect long polling to avoid proxy/network issues in dev environments
    db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
    const bucket = firebaseConfig.storageBucket
    storage = getStorage(app, bucket ? `gs://${bucket}` : undefined)
    // Optionally connect to local emulators in dev
    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' && typeof window !== 'undefined') {
      const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || '127.0.0.1'
      // Firestore
      const fsPort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || 8080)
      try {
        connectFirestoreEmulator(db, host, fsPort)
        console.info(`[Firebase] Connected Firestore emulator at ${host}:${fsPort}`)
      } catch (e) {
        console.warn('[Firebase] Failed to connect Firestore emulator:', e)
      }
      // Storage
      const stPort = Number(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || 9199)
      try {
        connectStorageEmulator(storage, host, stPort)
        console.info(`[Firebase] Connected Storage emulator at ${host}:${stPort}`)
      } catch (e) {
        console.warn('[Firebase] Failed to connect Storage emulator:', e)
      }
    }
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error)
}

export { auth, db, storage }
export default app
