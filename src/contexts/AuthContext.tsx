'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { auth, db } from '@/lib/firebase'
import { AuthUser, UserProfile } from '@/types/user'

interface AuthContextType {
  user: AuthUser | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>
  isFirebaseEnabled: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function toDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (value && typeof (value as any).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return new Date(value)
  }
  return new Date()
}

function sanitiseProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    displayName: profile.displayName ?? undefined,
    photoURL: profile.photoURL ?? undefined,
    favoriteColors: profile.favoriteColors ?? [],
    favoriteStyles: profile.favoriteStyles ?? [],
  }
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const isFirebaseEnabled = auth !== null && db !== null

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        }
        setUser(authUser)

        try {
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (profileSnap.exists()) {
            const data = profileSnap.data() as UserProfile
            setUserProfile(sanitiseProfile({
              ...data,
              updatedAt: toDate((data as any).updatedAt ?? data.updatedAt),
              createdAt: toDate((data as any).createdAt ?? data.createdAt),
            }))
          } else {
            const bootstrap: UserProfile = sanitiseProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName ?? undefined,
              photoURL: firebaseUser.photoURL ?? undefined,
              favoriteColors: [],
              favoriteStyles: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            await setDoc(doc(db, 'users', firebaseUser.uid), bootstrap, { merge: true })
            setUserProfile(bootstrap)
          }
        } catch (error) {
          console.warn('Failed to fetch user profile:', error)
          const fallback: UserProfile = sanitiseProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName ?? undefined,
            photoURL: firebaseUser.photoURL ?? undefined,
            favoriteColors: [],
            favoriteStyles: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          setUserProfile(fallback)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [isFirebaseEnabled])

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseEnabled) {
      throw new Error('Firebase is not properly configured')
    }
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!isFirebaseEnabled) {
      throw new Error('Firebase is not properly configured')
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const profile: UserProfile = sanitiseProfile({
      uid: firebaseUser.uid,
      email: firebaseUser.email || email,
      displayName: displayName ?? undefined,
      favoriteColors: [],
      favoriteStyles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await setDoc(doc(db, 'users', firebaseUser.uid), profile)
    setUserProfile(profile)
  }

  const logout = async () => {
    if (!isFirebaseEnabled) {
      throw new Error('Firebase is not properly configured')
    }
    await signOut(auth)
  }

  const updateUserProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!isFirebaseEnabled) {
      throw new Error('Firebase is not properly configured')
    }
    if (!user) throw new Error('No user logged in')
    if (!userProfile) throw new Error('User profile not ready')

    const merged = sanitiseProfile({
      ...userProfile,
      ...profileUpdates,
      favoriteColors: profileUpdates.favoriteColors ?? userProfile.favoriteColors,
      favoriteStyles: profileUpdates.favoriteStyles ?? userProfile.favoriteStyles,
      createdAt: userProfile.createdAt,
      updatedAt: new Date(),
    })

    await setDoc(doc(db, 'users', user.uid), merged, { merge: true })
    setUserProfile(merged)
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    isFirebaseEnabled,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}



