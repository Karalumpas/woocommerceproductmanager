import useSWR from 'swr'
import { useAppStore } from '../store'

interface ImportBatch {
  id: number
  shopId: number
  fileName: string
  fileSize: number
  type: 'parent' | 'variations'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalRows?: number
  processedRows?: number
  successfulRows?: number
  errorRows?: number
  errors?: any[]
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

interface ImportError {
  id: number
  batchId: number
  rowNumber: number
  sku: string
  errorType: string
  errorMessage: string
  rowData: any
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useImportBatches() {
  const { selectedShop } = useAppStore()
  
  const { data, error, mutate } = useSWR(
    selectedShop ? `/api/imports?shopId=${selectedShop}` : null,
    fetcher,
    {
      refreshInterval: 1000, // Poll every second for real-time updates
      revalidateOnFocus: false,
    }
  )

  return {
    batches: data?.batches || [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}

export function useImportBatch(batchId: number) {
  const { data, error, mutate } = useSWR(
    batchId ? `/api/imports/${batchId}` : null,
    fetcher,
    {
      refreshInterval: 1000, // Poll every second while processing
      revalidateOnFocus: false,
    }
  )

  return {
    batch: data?.batch as ImportBatch | undefined,
    errors: data?.errors || [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}

export async function createImportBatch(file: File, type: 'parent' | 'variations') {
  const { selectedShop } = useAppStore.getState()
  
  if (!selectedShop) {
    throw new Error('No shop selected')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('shopId', selectedShop.toString())

  const response = await fetch('/api/imports', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create import batch')
  }

  return response.json()
}

export async function cancelImportBatch(batchId: number) {
  const response = await fetch(`/api/imports/${batchId}/cancel`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to cancel import batch')
  }

  return response.json()
}
