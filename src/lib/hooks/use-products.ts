import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useAppStore } from '../store'

interface ProductShop {
  shopId: number
  priceOverride?: string | null
  shop?: {
    id: number
    name: string
  }
}

interface Product {
  id: number
  shopId: number
  wooId: number
  name: string
  slug: string
  type: string
  status: string
  sku: string
  price: string | null
  regularPrice: string | null
  salePrice: string | null
  stockStatus: string
  stockQuantity: number | null
  description: string
  shortDescription: string
  categories: any[]
  images: any[]
  attributes: any[]
  variations: any[]
  productShops?: ProductShop[]
  dateCreated: string
  dateModified: string
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  products: Product[]
  total: number
  hasMore: boolean
  totalPages: number
  currentPage: number
}

interface ProductFilters {
  category?: string
  brand?: string
  status?: string
  stockStatus?: string
  type?: string
  inShopId?: number
  sortBy?: 'name' | 'price' | 'dateCreated' | 'dateModified' | 'sku'
  sortOrder?: 'asc' | 'desc'
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useProducts(search: string = '', limit: number = 25, filters: ProductFilters = {}) {
  const { selectedShop } = useAppStore()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const buildUrl = (pageNum: number) => {
    if (!selectedShop) return null
    
    const params = new URLSearchParams({
      shopId: selectedShop.id.toString(),
      page: pageNum.toString(),
      limit: limit.toString(),
    })
    
    if (search) {
      params.append('search', search)
    }

    // Add filter parameters
    if (filters.category) {
      params.append('category', filters.category)
    }
    if (filters.brand) {
      params.append('brand', filters.brand)
    }
    if (filters.status) {
      params.append('status', filters.status)
    }
    if (filters.stockStatus) {
      params.append('stockStatus', filters.stockStatus)
    }
    if (filters.type) {
      params.append('type', filters.type)
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy)
    }
    if (filters.sortOrder) {
      params.append('sortOrder', filters.sortOrder)
    }

    // Include related shops information
    params.append('include', 'productShops')

    return `/api/products?${params.toString()}`
  }

  const { data, error, mutate } = useSWR(
    buildUrl(page),
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  )

  // Reset when search or filters change
  useEffect(() => {
    setAllProducts([])
    setPage(1)
    setHasMore(true)
  }, [search, selectedShop, filters])

  // Update products when data changes
  useEffect(() => {
    if (data?.products) {
      if (page === 1) {
        setAllProducts(data.products)
      } else {
        setAllProducts(prev => [...prev, ...data.products])
      }
      setHasMore(data.hasMore)
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    }
  }, [data, page])

  const loadMore = () => {
    if (hasMore && !error && data) {
      setPage(prev => prev + 1)
    }
  }

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setAllProducts([])
      setPage(pageNum)
    }
  }

  const resetProducts = () => {
    setAllProducts([])
    setPage(1)
    setHasMore(true)
    setTotalPages(1)
    setTotal(0)
  }

  return {
    products: allProducts,
    isLoading: !error && !data,
    error,
    hasMore,
    currentPage: page,
    totalPages,
    total,
    loadMore,
    goToPage,
    mutate: () => {
      resetProducts()
      mutate()
    },
  }
}

export function useProduct(productId: number) {
  const { data, error, mutate } = useSWR(
    productId ? `/api/products/${productId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    product: data?.product as Product | undefined,
    variations: data?.variations || [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}

export async function createProduct(productData: Partial<Product>) {
  const { selectedShop } = useAppStore.getState()
  
  if (!selectedShop) {
    throw new Error('No shop selected')
  }

  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...productData,
      shopId: selectedShop.id,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create product')
  }

  return response.json()
}

export async function updateProduct(productId: number, productData: Partial<Product>) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update product')
  }

  return response.json()
}

export async function deleteProduct(productId: number) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete product')
  }

  return response.json()
}

export async function syncProductWithWooCommerce(productId: number) {
  const response = await fetch(`/api/products/${productId}/sync`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to sync product')
  }

  return response.json()
}

export async function syncShopProducts(shopId: number) {
  const response = await fetch(`/api/products/sync?shopId=${shopId}`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to sync shop products')
  }

  return response.json()
}
