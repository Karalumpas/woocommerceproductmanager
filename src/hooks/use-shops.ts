import useSWR from 'swr'
import { useState } from 'react'
import type { Shop, NewShop } from '../lib/db/schema'

const API_BASE = '/api/shops'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  return res.json()
})

export function useShops() {
  const { data, error, mutate, isLoading } = useSWR<Shop[]>(API_BASE, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Revalidate every minute
    fallbackData: [], // Ensure we always have an array
  })

  // Ensure shops is always an array
  const shops = Array.isArray(data) ? data : []

  const createShop = async (shopData: Omit<NewShop, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopData),
    })

    if (!response.ok) {
      throw new Error('Failed to create shop')
    }

    const newShop = await response.json()
    mutate([...shops, newShop], false)
    return newShop
  }

  const updateShop = async (id: number, shopData: Partial<Shop>) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shopData),
    })

    if (!response.ok) {
      throw new Error('Failed to update shop')
    }

    const updatedShop = await response.json()
    mutate(
      shops.map((shop) => (shop.id === id ? updatedShop : shop)),
      false
    )
    return updatedShop
  }

  const deleteShop = async (id: number) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete shop')
    }

    mutate(
      shops.filter((shop) => shop.id !== id),
      false
    )
  }

  const testShopConnection = async (id: number) => {
    const response = await fetch(`${API_BASE}/${id}/test`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to test connection')
    }

    const result = await response.json()
    
    // Update the shop's status based on test result
    const shopIndex = shops.findIndex(shop => shop.id === id)
    if (shopIndex !== -1) {
      const updatedShops = [...shops]
      updatedShops[shopIndex] = {
        ...updatedShops[shopIndex],
        status: result.success ? 'online' : 'offline',
        lastPing: new Date(),
      }
      mutate(updatedShops, false)
    }
    
    return result
  }

  return {
    shops,
    isLoading,
    error,
    createShop,
    updateShop,
    deleteShop,
    testShopConnection,
    refresh: mutate,
  }
}
