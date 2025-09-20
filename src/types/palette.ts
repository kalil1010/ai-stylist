export interface OutfitColorPlan {
  top?: string
  bottom?: string
  outerwear?: string
  footwear?: string
  accessory?: string
}

export interface SavedPalette {
  id: string
  userId: string
  baseHex: string
  dominantHexes: string[]
  richMatches: any
  plan?: OutfitColorPlan
  source?: 'analyzer' | 'closet'
  createdAt: Date
  updatedAt: Date
}

export type NewSavedPalette = Omit<SavedPalette, 'id' | 'createdAt' | 'updatedAt'>

