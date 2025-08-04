'use client'

import { useAuth } from './auth-provider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '../navigation'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

// Sider der ikke kræver authentication
const publicRoutes = ['/login', '/register']

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Hvis vi stadig loader, vent
    if (isLoading) return

    // Tjek om den nuværende side er offentlig
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Hvis brugeren ikke er logget ind og ikke på en offentlig side
    if (!user && !isPublicRoute) {
      router.push('/login')
      return
    }

    // Hvis brugeren er logget ind og på login/register siden, redirect til dashboard
    if (user && isPublicRoute) {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, pathname, router])

  // Effekt til at synkronisere produkter fra default shop når brugeren logger ind
  useEffect(() => {
    if (user && user.autoSync && !isLoading && !isSyncing) {
      // Hent brugerens shops for at finde default shop
      const syncProducts = async () => {
        try {
          setIsSyncing(true)
          const response = await fetch('/api/shops')
          if (response.ok) {
            const shops = await response.json()
            const defaultShop = shops.find((shop: any) => shop.isDefault)
            
            if (defaultShop) {
              // Synkroniser produkter fra default shop i baggrunden
              await fetch(`/api/products/sync?shopId=${defaultShop.id}&maxProducts=1000`, {
                method: 'POST'
              })
            }
          }
        } catch (error) {
          console.error('Auto-sync error:', error)
        } finally {
          setIsSyncing(false)
        }
      }
      
      syncProducts()
    }
  }, [user, isLoading, isSyncing])

  // Vis loading mens vi tjekker authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Hvis på login/register siden, vis siden uden navigation og check
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Hvis ikke logget ind og ikke på offentlig side, vis ikke noget (redirect sker i useEffect)
  if (!user) {
    return null
  }

  // Hvis logget ind, vis siden med navigation
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50">
          <Loader2 className="animate-spin h-4 w-4" />
          <span>Synkroniserer produkter...</span>
        </div>
      )}
      <main>{children}</main>
    </div>
  )
}
