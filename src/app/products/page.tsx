'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { useProducts } from '../../lib/hooks/use-products'
import { useAppStore } from '../../lib/store'
import { CSVImportDialog, ImportBatchList } from '../../components/csv-import'
import { Toaster } from '../../components/toaster'
import {
  Search,
  Upload,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  ExternalLink,
  Package,
  DollarSign,
  Layers,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number
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
  images: any[]
  variations: any[]
  categories: any[]
  dateCreated: string
  dateModified: string
}

export default function ProductsPage() {
  const { selectedShop } = useAppStore()
  const [search, setSearch] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const {
    products,
    isLoading,
    error,
    hasMore,
    loadMore,
    mutate,
  } = useProducts(search)

  if (!selectedShop) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            No Shop Selected
          </h2>
          <p className="text-gray-500 mb-6">
            Please select a WooCommerce shop to manage products.
          </p>
          <Link href="/connections">
            <Button>Manage Connections</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const bulkActions = [
    { label: 'Sync with WooCommerce', action: 'sync' },
    { label: 'Update Stock Status', action: 'stock' },
    { label: 'Update Prices', action: 'prices' },
    { label: 'Export to CSV', action: 'export' },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">
            Manage your WooCommerce products and variations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CSVImportDialog>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </CSVImportDialog>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-2xl font-bold">
                $
                {products.length > 0
                  ? (
                      products
                        .filter(p => p.price)
                        .reduce((sum, p) => sum + parseFloat(p.price!), 0) /
                      products.filter(p => p.price).length
                    ).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Variations</p>
              <p className="text-2xl font-bold">
                {products.filter(p => p.type === 'variable').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold">
                {products.filter(p => p.stockStatus === 'outofstock').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedProducts.length} selected
            </span>
            <Button variant="outline" size="sm">
              Bulk Actions
            </Button>
          </div>
        )}
      </div>

      {/* Import Status */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Recent Imports</h3>
        <ImportBatchList />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-4 p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-900">Product</th>
                <th className="text-left p-4 font-medium text-gray-900">SKU</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Stock</th>
                <th className="text-left p-4 font-medium text-gray-900">Price</th>
                <th className="text-left p-4 font-medium text-gray-900">Type</th>
                <th className="text-left p-4 font-medium text-gray-900">Modified</th>
                <th className="w-4 p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && products.length === 0 ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="p-4">
                      <div className="h-16 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No products found</p>
                    <p className="text-sm text-gray-400">
                      {search ? 'Try adjusting your search terms' : 'Import products from CSV to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.includes(product.id)}
                    onSelect={(checked) => handleSelectProduct(product.id, checked)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="p-4 border-t bg-gray-50 text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More Products'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProductRowProps {
  product: Product
  isSelected: boolean
  onSelect: (checked: boolean) => void
}

function ProductRow({ product, isSelected, onSelect }: ProductRowProps) {
  const stockStatusColors = {
    instock: 'bg-green-100 text-green-800',
    outofstock: 'bg-red-100 text-red-800',
    onbackorder: 'bg-yellow-100 text-yellow-800',
  }

  const statusColors = {
    publish: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    private: 'bg-blue-100 text-blue-800',
  }

  const typeColors = {
    simple: 'bg-blue-100 text-blue-800',
    variable: 'bg-purple-100 text-purple-800',
    grouped: 'bg-orange-100 text-orange-800',
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-3">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].src}
              alt={product.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{product.name}</p>
            {product.categories && product.categories.length > 0 && (
              <p className="text-sm text-gray-500 truncate">
                {product.categories.map(c => c.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="p-4">
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {product.sku || 'No SKU'}
        </code>
      </td>
      <td className="p-4">
        <Badge className={statusColors[product.status as keyof typeof statusColors]}>
          {product.status}
        </Badge>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <Badge className={stockStatusColors[product.stockStatus as keyof typeof stockStatusColors]}>
            {product.stockStatus.replace(/([A-Z])/g, ' $1').trim()}
          </Badge>
          {product.stockQuantity !== null && (
            <p className="text-xs text-gray-500">Qty: {product.stockQuantity}</p>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          {product.salePrice ? (
            <>
              <p className="font-medium text-red-600">${product.salePrice}</p>
              <p className="text-xs text-gray-500 line-through">${product.regularPrice}</p>
            </>
          ) : (
            <p className="font-medium">${product.regularPrice || product.price || '0.00'}</p>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <Badge className={typeColors[product.type as keyof typeof typeColors]}>
            {product.type}
          </Badge>
          {product.type === 'variable' && product.variations && (
            <p className="text-xs text-gray-500">
              {product.variations.length} variations
            </p>
          )}
        </div>
      </td>
      <td className="p-4">
        <p className="text-sm text-gray-900">
          {new Date(product.dateModified).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(product.dateModified).toLocaleTimeString()}
        </p>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
