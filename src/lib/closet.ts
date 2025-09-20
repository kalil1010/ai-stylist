import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
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
    
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      } as ClothingItem)
    })
    
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
    const imageRef = ref(storage, item.imageUrl)
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
