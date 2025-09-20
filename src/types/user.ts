export interface UserProfile {
uid: string
email: string
displayName?: string
photoURL?: string
gender?: 'male' | 'female' | 'other'
age?: number
height?: number // in cm
weight?: number // in kg
favoriteColors?: string[]
favoriteStyles?: string[]
createdAt: Date
updatedAt: Date
}
export interface AuthUser {
uid: string
email: string | null
displayName: string | null
photoURL: string | null
emailVerified: boolean
}