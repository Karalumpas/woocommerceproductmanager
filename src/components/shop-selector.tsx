'use client'

import * as React from 'react'
import { Check, ChevronDown, Store } from 'lucide-react'
import { useShops } from '@/hooks/use-shops'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ShopSelector() {
  const { shops } = useShops()
  const { selectedShop, setSelectedShop } = useAppStore()

  const handleShopSelect = (shop: typeof shops[0]) => {
    setSelectedShop(shop)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Store className="h-4 w-4" />
          <span className="hidden md:inline-block">
            {selectedShop ? selectedShop.name : 'Select Shop'}
          </span>
          {selectedShop && (
            <div className={cn(
              'h-2 w-2 rounded-full',
              selectedShop.status === 'online' ? 'bg-green-500' :
              selectedShop.status === 'offline' ? 'bg-red-500' :
              'bg-yellow-500'
            )} />
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select WooCommerce Shop</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {shops.length === 0 ? (
          <DropdownMenuItem disabled>
            No shops connected
          </DropdownMenuItem>
        ) : (
          shops.map((shop) => (
            <DropdownMenuItem
              key={shop.id}
              onClick={() => handleShopSelect(shop)}
              className="flex items-center space-x-2"
            >
              <Store className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{shop.name}</div>
                <div className="text-xs text-muted-foreground">{shop.baseUrl}</div>
              </div>
              <div className={cn(
                'h-2 w-2 rounded-full',
                shop.status === 'online' ? 'bg-green-500' :
                shop.status === 'offline' ? 'bg-red-500' :
                'bg-yellow-500'
              )} />
              {selectedShop?.id === shop.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
