'use client'

import React from 'react'
import { auth, db, storage } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function mask(value?: string | null, opts?: { keepStart?: number; keepEnd?: number }) {
  if (!value) return '(empty)'
  const keepStart = opts?.keepStart ?? 6
  const keepEnd = opts?.keepEnd ?? 4
  if (value.length <= keepStart + keepEnd) return value
  return `${value.slice(0, keepStart)}…${value.slice(-keepEnd)}`
}

export function FirebaseDiagnostics() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Avoid hydration mismatch: derive host only after mount
  const [host, setHost] = React.useState('')
  React.useEffect(() => {
    setHost(window.location.host)
  }, [])

  const status = {
    authInitialized: !!auth,
    firestoreInitialized: !!db,
    storageInitialized: !!storage,
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Firebase Diagnostics</CardTitle>
        <CardDescription>Visible only in development. Values are masked.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div><span className="text-gray-500">apiKey:</span> <span className="font-mono">{mask(cfg.apiKey)}</span></div>
        <div><span className="text-gray-500">authDomain:</span> <span className="font-mono">{cfg.authDomain || '(empty)'}</span></div>
        <div><span className="text-gray-500">projectId:</span> <span className="font-mono">{cfg.projectId || '(empty)'}</span></div>
        <div><span className="text-gray-500">storageBucket:</span> <span className="font-mono">{cfg.storageBucket || '(empty)'}</span></div>
        <div><span className="text-gray-500">messagingSenderId:</span> <span className="font-mono">{cfg.messagingSenderId || '(empty)'}</span></div>
        <div><span className="text-gray-500">appId:</span> <span className="font-mono">{mask(cfg.appId, { keepStart: 6, keepEnd: 6 })}</span></div>
        <div className="pt-2"><span className="text-gray-500">auth initialized:</span> <span className="font-mono">{String(status.authInitialized)}</span></div>
        <div><span className="text-gray-500">firestore initialized:</span> <span className="font-mono">{String(status.firestoreInitialized)}</span></div>
        <div><span className="text-gray-500">storage initialized:</span> <span className="font-mono">{String(status.storageInitialized)}</span></div>
        <div><span className="text-gray-500">current host:</span> <span className="font-mono">{host || '(loading...)'}</span></div>
      </CardContent>
    </Card>
  )
}
