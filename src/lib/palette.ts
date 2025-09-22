// palette.ts

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { NewSavedPalette } from '@/types/palette';

/**
 * Saves a new palette document for the authenticated user.
 *
 * @param {NewSavedPalette} payload - The palette data (excluding ownerId and timestamps).
 * @param {string} paletteId - The Firestore document ID to assign.
 * @returns {Promise<string>} - The ID of the saved document.
 */
export async function savePaletteForUser(
  payload: NewSavedPalette,
  paletteId: string
): Promise<string> {
  // Ensure user is signed in
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be signed in to save a palette.');
  }

  try {
    // Reference the document with the provided ID
    const paletteRef = doc(db, 'palettes', paletteId);

    // Merge payload with ownership and timestamps
    await setDoc(paletteRef, {
      ...payload,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return paletteRef.id;
  } catch (e: any) {
    const code = e.code || 'unknown';
    const message = e.message || String(e);
    console.error('[palettes] save failed:', code, message);
    throw new Error(`Save failed (${code}): ${message}`);
  }
}
