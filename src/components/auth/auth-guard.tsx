'use client'

import { useAuth } from './auth-provider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '../navigation'

interface AuthGuardProps {
  children: React.ReactNode
}

// Sider der ikke kræver authentication
const publicRoutes = ['/login', '/register']

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

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
      <main>{children}</main>
    </div>
  )
}
