'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Upload, Download, Filter, Grid, List } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ProductList } from '../../components/products/product-list'
import { ProductCard } from '../../components/products/product-card'
import { ImportProducts } from '../../components/products/import-products'
import { ExportProducts } from '../../components/products/export-products'
import { CreateProduct } from '../../components/products/create-product'
import { SyncProgress } from '../../components/products/sync-progress'
import { useProducts } from '../../lib/hooks/use-products'
import { useAppStore } from '../../lib/store'
import { Toaster } from '../../components/ui/toaster'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  
  const { selectedShop, setSelectedShop } = useAppStore()
  const { products, isLoading, error, mutate } = useProducts(searchTerm)

  // Auto-select first shop if none selected
  useEffect(() => {
    if (!selectedShop) {
      fetch('/api/shops')
        .then(res => res.json())
        .then(shops => {
          if (shops && shops.length > 0) {
            console.log('Auto-selecting shop:', shops[0].name)
            setSelectedShop(shops[0])
          }
        })
        .catch(console.error)
    }
  }, [selectedShop, setSelectedShop])

  if (!selectedShop) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Shop Selected</h2>
            <p className="text-muted-foreground">Please select a shop to view products.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your WooCommerce products for {selectedShop.name}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {selectedShop && (
            <SyncProgress 
              shopId={selectedShop.id} 
              shopName={selectedShop.name} 
              onSyncComplete={() => mutate()} 
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products List/Grid */}
      <ProductList
        products={products || []}
        isLoading={isLoading}
        error={error}
        viewMode={viewMode}
        onProductSelect={setSelectedProduct}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductCard
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={() => {
            // Refresh products list
            // This will be handled by SWR automatically
          }}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportProducts
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          shopId={selectedShop.id}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportProducts
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          shopId={selectedShop.id}
        />
      )}

      {/* Create Product Modal */}
      {showCreate && (
        <CreateProduct
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          shopId={selectedShop.id}
        />
      )}
    </div>
  )
}
