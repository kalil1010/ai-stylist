import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { NewSavedPalette } from '@/types/palette'

export async function savePaletteForUser(userId: string, payload: NewSavedPalette): Promise<string> {
  try {
    const { userId: _ignoredUserId, ...rest } = payload
    const ref = await addDoc(collection(db, 'palettes'), {
      userId,
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  } catch (e: any) {
    // Surface helpful message to caller
    const code = e?.code || 'unknown'
    const message = e?.message || String(e)
    console.error('[palettes] save failed:', code, message)
    throw new Error(`Save failed (${code}): ${message}`)
  }
}
