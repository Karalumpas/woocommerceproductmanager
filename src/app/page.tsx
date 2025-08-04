'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export default function HomePage() {
  const router = useRouter()
  const { selectedShop } = useAppStore()

  useEffect(() => {
    // Redirect to connections if no shop is selected
    if (!selectedShop) {
      router.push('/connections')
    } else {
      router.push('/dashboard')
    }
  }, [selectedShop, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
