'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Shirt, 
  MessageCircle, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Home,
  Palette
} from 'lucide-react'

export function Navigation() {
  const { user, userProfile, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/outfit', label: 'Outfit Suggestions', icon: Sparkles },
    { href: '/closet', label: 'My Closet', icon: Shirt },
    { href: '/chat', label: 'Stylist Chat', icon: MessageCircle },
    { href: '/analyzer', label: 'Color Analyzer', icon: Palette },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">AI Stylist</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={(userProfile?.photoURL as string) || (user.photoURL as string) || ''} />
                    <AvatarFallback>
                      {userProfile?.displayName?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
