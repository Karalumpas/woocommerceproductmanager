import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Shop } from '@/lib/db/schema'

interface AppState {
  selectedShop: Shop | null
  setSelectedShop: (shop: Shop | null) => void
  clearSelectedShop: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedShop: null,
      setSelectedShop: (shop) => set({ selectedShop: shop }),
      clearSelectedShop: () => set({ selectedShop: null }),
    }),
    {
      name: 'woocommerce-manager-store',
      partialize: (state) => ({ selectedShop: state.selectedShop }),
    }
  )
)
