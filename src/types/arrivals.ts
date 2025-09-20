export type GenderTarget = "male" | "female" | "unisex"

export type PriceLabel = "Budget" | "Mid-Range" | "Premium"

export interface FashionPiece {
  id: string
  title: string
  description: string
  brand: string
  gender: GenderTarget
  priceLabel: PriceLabel
  categories: string[]
  imageUrl: string
  sourceUrl: string
  store: string
  price?: string
  highlights?: string[]
  materials?: string[]
  colors?: string[]
  fit?: string
}
