export type Market = 'Egypt'
export type TrendGender = 'male' | 'female' | 'unisex'

export interface FashionTrend {
  id: string
  title: string
  description: string
  market: Market
  imageUrl: string
  gender: TrendGender
  minAge?: number
  maxAge?: number
  city?: string
  priceLabel?: string
  tags?: string[]
  storeNote?: string
}

export const FASHION_TRENDS: FashionTrend[] = [
  {
    id: 'egypt-cairo-lux-evening',
    title: 'Zamalek Evening Sheers',
    description: 'Sheer overlay gowns layered over satin slips with crystal waist belts. Cairo rooftops are pairing them with sculptural earrings and strappy metallic heels.',
    market: 'Egypt',
    city: 'Cairo · Zamalek',
    priceLabel: 'Mid-High',
    tags: ['evening', 'sheer overlay', 'metallic accent'],
    storeNote: 'Seen at Maison 69 and Beymen CityStars Ramadan capsule.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    gender: 'female',
    minAge: 24,
    maxAge: 42,
  },
  {
    id: 'egypt-newcairo-smart-casual',
    title: 'Fifth Settlement Soft Tailoring',
    description: 'Relaxed double-breasted vests with wide-leg trousers in dusty neutrals, styled with minimal gold jewelry for office-to-dinner flexibility.',
    market: 'Egypt',
    city: 'New Cairo · Fifth Settlement',
    priceLabel: 'Mid-Range',
    tags: ['smart casual', 'tailored vest', 'work-ready'],
    storeNote: 'Featured across Orange Square boutiques and In Your Shoe pop-ups.',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    gender: 'female',
    minAge: 26,
    maxAge: 45,
  },
  {
    id: 'egypt-alex-linen-coord',
    title: 'Alex Corniche Linen Co-ords',
    description: 'Breathable linen shirts paired with drawstring trousers in sea-glass tones, finished with espadrilles and woven belts for coastal evenings.',
    market: 'Egypt',
    city: 'Alexandria · Corniche',
    priceLabel: 'Accessible',
    tags: ['linen', 'resort', 'evening stroll'],
    storeNote: 'Limited drop from Concrete and local ateliers on Fouad Street.',
    imageUrl: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
    gender: 'male',
    minAge: 27,
    maxAge: 48,
  },
  {
    id: 'egypt-downtown-street-denim',
    title: 'Downtown Graphic Denim',
    description: 'Boxy cropped denim jackets styled with vintage band tees, cargo minis, and chunky sneakers spotted around Abdeen weekend markets.',
    market: 'Egypt',
    city: 'Cairo · Downtown',
    priceLabel: 'Budget-Friendly',
    tags: ['streetwear', 'denim', 'graphic tee'],
    storeNote: 'Popular at Up-Fuse pop-up and Thrift Squad round-ups.',
    imageUrl: 'https://images.unsplash.com/photo-1516822003754-cca485356ecb?auto=format&fit=crop&w=900&q=80',
    gender: 'unisex',
    minAge: 18,
    maxAge: 32,
  },
  {
    id: 'egypt-gouna-resort-knit',
    title: 'Gouna Crochet Resort Sets',
    description: 'Breathable crochet polos with pleated shorts in tropical hues for daytime yacht brunches along the marina.',
    market: 'Egypt',
    city: 'El Gouna · Marina',
    priceLabel: 'Mid-High',
    tags: ['resort', 'crochet', 'brunch'],
    storeNote: 'Fresh drop from The Sahara Collective and Villa Baboushka.',
    imageUrl: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=900&q=80',
    gender: 'male',
    minAge: 25,
    maxAge: 45,
  },
  {
    id: 'egypt-maadi-weekend-pastels',
    title: 'Maadi Brunch Pastels',
    description: 'Pleated midi skirts paired with cropped cardigans in pistachio and lilac tones, anchored with white loafers for leafy café runs.',
    market: 'Egypt',
    city: 'Cairo · Maadi',
    priceLabel: 'Mid-Range',
    tags: ['brunch', 'pastels', 'loafer'],
    storeNote: 'Spotted at Capsule Wardrobe and Esprit Maadi franchises.',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
    gender: 'female',
    minAge: 23,
    maxAge: 38,
  },
]
