'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Cable, BarChart3, Package } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShopSelector } from '@/components/shop-selector'
import { UserMenu } from './auth/user-menu'

const navigation = [
  {
    name: 'Connections',
    href: '/connections',
    icon: Cable,
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const { selectedShop } = useAppStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Package className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              WooCommerce Manager
            </span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 transition-colors hover:text-foreground/80',
                  isActive
                    ? 'text-foreground'
                    : 'text-foreground/60',
                  // Disable dashboard and products if no shop selected
                  !selectedShop && (item.href === '/dashboard' || item.href === '/products')
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                )}
                onClick={(e) => {
                  if (!selectedShop && (item.href === '/dashboard' || item.href === '/products')) {
                    e.preventDefault()
                  }
                }}
              >
                <Icon className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline-block">{item.name}</span>
                <Icon className="h-4 w-4 hidden md:inline-block" />
              </Link>
            )
          })}
        </nav>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            <ShopSelector />
            <UserMenu />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
