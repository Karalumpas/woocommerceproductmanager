'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import useSWR from 'swr'

interface StockChartProps {
  shopId: number
}

interface StockData {
  name: string
  inStock: number
  outOfStock: number
  onBackorder: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StockChart({ shopId }: StockChartProps) {
  const { data: stockData, isLoading } = useSWR<StockData[]>(
    `/api/dashboard/${shopId}/stock-chart`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Status Overview</CardTitle>
          <CardDescription>
            Product stock status by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Status Overview</CardTitle>
        <CardDescription>
          Product stock status by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="inStock" stackId="a" fill="#22c55e" name="In Stock" />
              <Bar dataKey="outOfStock" stackId="a" fill="#ef4444" name="Out of Stock" />
              <Bar dataKey="onBackorder" stackId="a" fill="#f59e0b" name="On Backorder" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
