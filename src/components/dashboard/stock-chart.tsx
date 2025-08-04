'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import useSWR from 'swr'

interface StockChartProps {
  shopId: number
}

interface ChartItem {
  name: string
  value: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getColorByName = (name: string) => {
  if (name.includes('In Stock')) return '#22c55e';
  if (name.includes('Out of Stock')) return '#ef4444';
  if (name.includes('On Backorder')) return '#f59e0b';
  return '#6b7280';
}

export function StockChart({ shopId }: StockChartProps) {
  const { data, isLoading } = useSWR<ChartItem[]>(
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
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  name="Count"
                  isAnimationActive={true}
                  fillOpacity={0.8}
                  stroke="#000000"
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  barSize={60}
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByName(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No stock data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
