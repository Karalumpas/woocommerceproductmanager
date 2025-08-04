'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '../../lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (userData: User) => {
    setUser(userData)
    
    // If user has autoSync enabled, trigger sync for default shop
    if (userData.autoSync) {
      try {
        // Get user's shops to find default shop
        const shopsResponse = await fetch('/api/shops')
        if (shopsResponse.ok) {
          const shops = await shopsResponse.json()
          const defaultShop = shops.find((shop: any) => shop.isDefault)
          
          if (defaultShop) {
            // Trigger background sync for default shop
            fetch(`/api/products/sync?shopId=${defaultShop.id}&maxProducts=100`, {
              method: 'POST'
            }).catch(error => {
              console.error('Auto-sync failed:', error)
            })
          }
        }
      } catch (error) {
        console.error('Auto-sync error:', error)
      }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
