/*
 * Utility to scrub Firestore documents that still reference emulator-only assets.
 * Run with: npx ts-node scripts/fix-emulator-urls.ts
 */

import admin from 'firebase-admin';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function initAdmin() {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = getRequiredEnv('FIREBASE_ADMIN_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_ADMIN_CLIENT_EMAIL');
  const rawKey = getRequiredEnv('FIREBASE_ADMIN_PRIVATE_KEY');
  const privateKey = rawKey.replace(/\\n/g, '\n');
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });

  return admin.app();
}

function isEmulatorUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /https?:\/\/(127\.0\.0\.1|localhost)/.test(value);
}

async function scrubUserProfiles(db: admin.firestore.Firestore) {
  const snapshots = await db.collection('users').get();
  const batch = db.batch();
  let updates = 0;

  snapshots.forEach((docSnap) => {
    const data = docSnap.data();
    if (isEmulatorUrl(data.photoURL)) {
      batch.update(docSnap.ref, {
        photoURL: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      updates += 1;
    }
  });

  if (updates > 0) {
    await batch.commit();
  }

  return updates;
}

async function scrubClosetItems(db: admin.firestore.Firestore) {
  const snapshots = await db.collection('clothing').get();
  const batch = db.batch();
  let deletions = 0;

  snapshots.forEach((docSnap) => {
    const data = docSnap.data();
    if (isEmulatorUrl(data.imageUrl)) {
      batch.delete(docSnap.ref);
      deletions += 1;
    }
  });

  if (deletions > 0) {
    await batch.commit();
  }

  return deletions;
}

async function run() {
  const app = initAdmin();
  const db = app.firestore();

  console.info('Scanning for emulator URLs...');
  const [userUpdates, clothingDeletions] = await Promise.all([
    scrubUserProfiles(db),
    scrubClosetItems(db),
  ]);

  console.info(`Cleaned ${userUpdates} user profiles.`);
  console.info(`Removed ${clothingDeletions} closet items with emulator images.`);

  await app.delete();
}

run().catch((err) => {
  console.error('Failed to scrub emulator URLs:', err);
  process.exitCode = 1;
});
