'use client'

import React, { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const toggleMode = () => setMode((m) => (m === 'login' ? 'signup' : 'login'))

  return (
    <div className="container mx-auto px-4 py-8">
      {mode === 'login' ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <SignUpForm onToggleMode={toggleMode} />
      )}
    </div>
  )
}
