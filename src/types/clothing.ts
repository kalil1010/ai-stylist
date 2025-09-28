export interface ClothingItem {
  id: string
  userId: string
  imageUrl: string
  storagePath?: string
  garmentType: 'top' | 'bottom' | 'footwear' | 'accessory' | 'outerwear'
  dominantColors: string[]
  // Optional AI-enriched fields
  primaryHex?: string
  colorNames?: string[]
  aiMatches?: {
    complementary: string
    analogous: string[]
    triadic: string[]
  }
  description?: string
  brand?: string
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all'
  createdAt: Date
  updatedAt: Date
}

export interface ColorAnalysis {
  dominantColors: string[]
  colorPercentages: { [color: string]: number }
}
