import { collection, query, where, getDocs, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore'
import { normalizeStorageUrl, extractStoragePath } from '@/lib/storage'
import { deleteObject, ref } from 'firebase/storage'
import { db, storage, isUsingEmulators } from '@/lib/firebase'
import { ClothingItem } from '@/types/clothing'

export async function getUserClothing(userId: string): Promise<ClothingItem[]> {
  try {
    const q = query(
      collection(db, 'clothing'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const items: ClothingItem[] = []
    const pendingUpdates: Promise<void>[] = []

    for (const snapshotDoc of querySnapshot.docs) {
      const data = snapshotDoc.data() as Record<string, any>
      const rawUrl = typeof data.imageUrl === 'string' ? data.imageUrl : ''
      const imageUrl = normalizeStorageUrl(rawUrl)
      const storagePath = data.storagePath || extractStoragePath(rawUrl)

      const createdAtSource = data.createdAt
      const updatedAtSource = data.updatedAt
      const createdAt = createdAtSource?.toDate ? createdAtSource.toDate() : (createdAtSource ? new Date(createdAtSource) : new Date())
      const updatedAt = updatedAtSource?.toDate ? updatedAtSource.toDate() : (updatedAtSource ? new Date(updatedAtSource) : createdAt)

      const docData = {
        id: snapshotDoc.id,
        ...data,
        imageUrl,
        ...(storagePath ? { storagePath } : {}),
        createdAt,
        updatedAt,
      } as ClothingItem

      items.push(docData)

      if (!isUsingEmulators) {
        const updates: Record<string, any> = {}
        if (rawUrl && rawUrl !== imageUrl) {
          updates.imageUrl = imageUrl
        }
        if (storagePath && !data.storagePath) {
          updates.storagePath = storagePath
        }
        if (Object.keys(updates).length > 0) {
          pendingUpdates.push(updateDoc(doc(db, 'clothing', snapshotDoc.id), updates))
        }
      }
    }

    if (pendingUpdates.length > 0) {
      await Promise.allSettled(pendingUpdates)
    }

    return items
  } catch (error) {
    console.error('Failed to fetch clothing items:', error)
    return []
  }
}

export async function deleteClothingItem(item: ClothingItem): Promise<void> {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'clothing', item.id))
    
    // Delete image from Storage
    const targetPath = item.storagePath || extractStoragePath(item.imageUrl) || item.imageUrl
    const imageRef = ref(storage, targetPath)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Failed to delete clothing item:', error)
    throw error
  }
}

export function groupClothingByType(items: ClothingItem[]): { [key: string]: ClothingItem[] } {
  return items.reduce((groups, item) => {
    const type = item.garmentType
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(item)
    return groups
  }, {} as { [key: string]: ClothingItem[] })
}
export interface ClosetItemSummary {
  id: string
  garmentType: ClothingItem['garmentType']
  brand?: string
  description?: string
  dominantColors?: string[]
}

export function toClosetSummary(
  items: ClothingItem[],
  limit = 15,
): ClosetItemSummary[] {
  return items.slice(0, limit).map((item) => ({
    id: item.id,
    garmentType: item.garmentType,
    brand: item.brand,
    description: item.description,
    dominantColors: item.dominantColors,
  }))
}

export function summariseClosetForPrompt(items: ClosetItemSummary[], limit = 20): string[] {
  return items.slice(0, limit).map((item) => {
    const brand = item.brand ? ` (${item.brand})` : ''
    const colours = item.dominantColors && item.dominantColors.length > 0 ? ` - Colours: ${item.dominantColors.join(', ')}` : ''
    const detail = item.description ? item.description : 'No description provided'
    return `${item.garmentType.toUpperCase()}${brand}: ${detail}${colours}`
  })
}
