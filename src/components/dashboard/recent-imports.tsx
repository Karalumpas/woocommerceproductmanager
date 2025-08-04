'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import useSWR from 'swr'

interface RecentImportsProps {
  shopId: number
}

interface ImportBatch {
  id: number
  filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalRows: number
  processedRows: number
  successfulRows: number
  errorRows: number
  createdAt: string
  completedAt?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function RecentImports({ shopId }: RecentImportsProps) {
  const { data: imports, isLoading } = useSWR<ImportBatch[]>(
    `/api/imports?shopId=${shopId}&limit=5`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
          <CardDescription>
            Latest CSV import batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Imports</CardTitle>
        <CardDescription>
          Latest CSV import batches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {imports && imports.length > 0 ? (
            imports.map((importBatch) => (
              <div
                key={importBatch.id}
                className="flex items-center justify-between space-x-4 border-b pb-3 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {importBatch.filename}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(importBatch.status)}>
                      {importBatch.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {importBatch.successfulRows}/{importBatch.totalRows} rows
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(importBatch.createdAt)}
                  </p>
                </div>
                {importBatch.status === 'processing' && (
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No imports yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
