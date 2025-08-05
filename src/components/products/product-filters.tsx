'use client'

import { useState, useEffect } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

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

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  categories: string[]
  brands: string[]
  shops?: { id: number; name: string }[]
}

export function ProductFilters({
  filters,
  onFiltersChange,
  categories = [],
  brands = [],
  shops = []
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof ProductFilters, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [key]: value !== '' ? value : undefined }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters = { sortBy: 'dateModified', sortOrder: 'desc' } as ProductFilters
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    const { sortBy, sortOrder, ...otherFilters } = filters
    return Object.values(otherFilters).filter(Boolean).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center justify-between">
              Filter Products
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <div className="flex gap-2">
                <Select
                  value={localFilters.sortBy || 'dateModified'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                    <SelectItem value="dateCreated">Date Created</SelectItem>
                    <SelectItem value="dateModified">Date Modified</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={localFilters.sortOrder || 'desc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">↑</SelectItem>
                    <SelectItem value="desc">↓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={localFilters.category || 'all'}
                  onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Brand Filter */}
            {brands.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select
                  value={localFilters.brand || 'all'}
                  onValueChange={(value) => handleFilterChange('brand', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={localFilters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="publish">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stock Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Status</label>
              <Select
                value={localFilters.stockStatus || 'all'}
                onValueChange={(value) => handleFilterChange('stockStatus', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All stock statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stock statuses</SelectItem>
                  <SelectItem value="instock">In Stock</SelectItem>
                  <SelectItem value="outofstock">Out of Stock</SelectItem>
                  <SelectItem value="onbackorder">On Backorder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Type</label>
              <Select
                value={localFilters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                  <SelectItem value="grouped">Grouped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exists In Shop Filter */}
            {shops.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Exists In Shop</label>
                <Select
                  value={localFilters.inShopId ? localFilters.inShopId.toString() : 'all'}
                  onValueChange={(value) => handleFilterChange('inShopId', value === 'all' ? undefined : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All shops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All shops</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id.toString()}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
