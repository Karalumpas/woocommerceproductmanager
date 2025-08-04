'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingUp, AlertTriangle, DollarSign, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useDashboard } from '@/hooks/use-dashboard'
import { formatPrice, formatDate } from '@/lib/utils'
import { StockChart } from '@/components/dashboard/stock-chart'
import { RecentImports } from '@/components/dashboard/recent-imports'

export default function DashboardPage() {
  const router = useRouter()
  const { selectedShop } = useAppStore()
  const { data: stats, isLoading, error } = useDashboard(selectedShop?.id)

  useEffect(() => {
    if (!selectedShop) {
      router.push('/connections')
    }
  }, [selectedShop, router])

  if (!selectedShop) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground text-center">
              There was an error loading the dashboard data. Please check your connection.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      description: 'Parent products in store',
      icon: Package,
      trend: stats?.productsTrend || 0,
    },
    {
      title: 'Total Variations',
      value: stats?.totalVariations || 0,
      description: 'Product variations',
      icon: TrendingUp,
      trend: stats?.variationsTrend || 0,
    },
    {
      title: 'Out of Stock',
      value: stats?.outOfStockCount || 0,
      description: 'Products needing restock',
      icon: AlertTriangle,
      trend: stats?.outOfStockTrend || 0,
    },
    {
      title: 'Average Price',
      value: formatPrice(stats?.averagePrice || 0),
      description: 'Across all products',
      icon: DollarSign,
      trend: stats?.priceTrend || 0,
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of {selectedShop.name}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {formatDate(stats?.lastUpdated)}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          const isPositiveTrend = kpi.trend >= 0
          const trendColor = isPositiveTrend ? 'text-green-600' : 'text-red-600'
          
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                  {kpi.trend !== 0 && (
                    <p className={`text-xs ${trendColor}`}>
                      {isPositiveTrend ? '+' : ''}{kpi.trend}%
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts and Additional Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <StockChart shopId={selectedShop.id} />
        </div>
        <div className="col-span-3">
          <RecentImports shopId={selectedShop.id} />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topCategories?.map((category, index) => (
                <div key={category.name} className="flex justify-between items-center">
                  <span className="text-sm">{category.name}</span>
                  <span className="text-sm font-medium">{category.count}</span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No categories found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Stock Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">In Stock</span>
                <span className="text-sm font-medium text-green-600">
                  {stats?.stockStatus?.inStock || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Out of Stock</span>
                <span className="text-sm font-medium text-red-600">
                  {stats?.stockStatus?.outOfStock || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">On Backorder</span>
                <span className="text-sm font-medium text-yellow-600">
                  {stats?.stockStatus?.onBackorder || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <span className="text-sm">{activity.description}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
