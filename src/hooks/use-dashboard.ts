import useSWR from 'swr'

interface DashboardStats {
  totalProducts: number
  totalVariations: number
  outOfStockCount: number
  averagePrice: number
  lastUpdated: string
  productsTrend: number
  variationsTrend: number
  outOfStockTrend: number
  priceTrend: number
  topCategories: Array<{ name: string; count: number }>
  stockStatus: {
    inStock: number
    outOfStock: number
    onBackorder: number
  }
  recentActivity: Array<{
    description: string
    timestamp: string
  }>
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useDashboard(shopId?: number) {
  const { data, error, mutate, isLoading } = useSWR<DashboardStats>(
    shopId ? `/api/dashboard/${shopId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    data,
    isLoading,
    error,
    refresh: mutate,
  }
}
