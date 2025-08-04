'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ProductCard } from './product-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { Pagination } from '../ui/pagination'
import { 
  Package, 
  Edit2, 
  ExternalLink, 
  MoreHorizontal,
  Grid,
  List,
  Send,
  CheckSquare,
  Square
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

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
  variationsCount?: number
  dateCreated: string
  dateModified: string
  createdAt: string
  updatedAt: string
}

interface ProductListProps {
  products: Product[]
  isLoading: boolean
  error: any
  viewMode: 'grid' | 'list'
  onProductSelect: (product: Product) => void
  selectedProducts?: Product[]
  onProductsSelectionChange?: (products: Product[]) => void
  shops?: any[]
  onSendToShop?: (products: Product[], targetShopId: number) => void
  currentPage?: number
  totalPages?: number
  total?: number
  onPageChange?: (page: number) => void
  showLoadMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export function ProductList({ 
  products, 
  isLoading, 
  error, 
  viewMode, 
  onProductSelect,
  selectedProducts = [],
  onProductsSelectionChange,
  shops = [],
  onSendToShop,
  currentPage = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  showLoadMore = false,
  hasMore = false,
  onLoadMore
}: ProductListProps) {
  
  const handleProductToggle = (product: Product) => {
    if (!onProductsSelectionChange) return
    
    const isSelected = selectedProducts.some(p => p.id === product.id)
    if (isSelected) {
      onProductsSelectionChange(selectedProducts.filter(p => p.id !== product.id))
    } else {
      onProductsSelectionChange([...selectedProducts, product])
    }
  }

  const handleSelectAll = () => {
    if (!onProductsSelectionChange) return
    
    const allSelected = products.every(p => selectedProducts.some(sp => sp.id === p.id))
    if (allSelected) {
      // Deselect all current page products
      const currentPageIds = products.map(p => p.id)
      onProductsSelectionChange(selectedProducts.filter(p => !currentPageIds.includes(p.id)))
    } else {
      // Select all current page products
      const newSelections = products.filter(p => !selectedProducts.some(sp => sp.id === p.id))
      onProductsSelectionChange([...selectedProducts, ...newSelections])
    }
  }

  const handleSendToShop = (targetShopId: number) => {
    if (onSendToShop && selectedProducts.length > 0) {
      onSendToShop(selectedProducts, targetShopId)
    }
  }
  
  // Debug: Log all products to see their structure
  console.log('ProductList Debug - All products:', products?.slice(0, 2)?.map(p => ({
    name: p.name,
    images: p.images,
    hasImages: p.images && Array.isArray(p.images) && p.images.length > 0,
    firstImageSrc: p.images?.[0]?.src
  })))
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500">
            <Package className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
            <p className="text-sm">{error.message || 'Failed to load products'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-sm text-gray-600">
            No products match your current search criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="space-y-6">
        {/* Bulk Actions Header */}
        {onProductsSelectionChange && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {products.every(p => selectedProducts.some(sp => sp.id === p.id)) ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All ({products.length})
              </Button>
              
              {selectedProducts.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            {selectedProducts.length > 0 && shops.length > 0 && onSendToShop && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send to Shop
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {shops.map((shop) => (
                    <DropdownMenuItem
                      key={shop.id}
                      onClick={() => handleSendToShop(shop.id)}
                    >
                      {shop.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Products Stats */}
        {total > 0 && (
          <div className="text-sm text-gray-600">
            Showing {products.length} of {total} products
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductGridItem 
              key={product.id} 
              product={product} 
              onSelect={() => onProductSelect(product)}
              isSelected={selectedProducts.some(p => p.id === product.id)}
              onToggleSelect={() => handleProductToggle(product)}
              showCheckbox={!!onProductsSelectionChange}
            />
          ))}
        </div>

        {/* Load More Button for infinite scroll mode */}
        {showLoadMore && hasMore && onLoadMore && (
          <div className="flex justify-center">
            <Button onClick={onLoadMore} variant="outline">
              Load More Products
            </Button>
          </div>
        )}

        {/* Pagination */}
        {onPageChange && totalPages > 1 && !showLoadMore && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions Header */}
      {onProductsSelectionChange && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {products.every(p => selectedProducts.some(sp => sp.id === p.id)) ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Select All ({products.length})
            </Button>
            
            {selectedProducts.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedProducts.length > 0 && shops.length > 0 && onSendToShop && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send to Shop
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {shops.map((shop) => (
                  <DropdownMenuItem
                    key={shop.id}
                    onClick={() => handleSendToShop(shop.id)}
                  >
                    {shop.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Products Stats */}
      {total > 0 && (
        <div className="text-sm text-gray-600">
          Showing {products.length} of {total} products
        </div>
      )}

      <div className="space-y-2">
        {products.map((product) => (
          <ProductListItem 
            key={product.id} 
            product={product} 
            onSelect={() => onProductSelect(product)}
            isSelected={selectedProducts.some(p => p.id === product.id)}
            onToggleSelect={() => handleProductToggle(product)}
            showCheckbox={!!onProductsSelectionChange}
          />
        ))}
      </div>

      {/* Load More Button for infinite scroll mode */}
      {showLoadMore && hasMore && onLoadMore && (
        <div className="flex justify-center">
          <Button onClick={onLoadMore} variant="outline">
            Load More Products
          </Button>
        </div>
      )}

      {/* Pagination */}
      {onPageChange && totalPages > 1 && !showLoadMore && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

interface ProductItemProps {
  product: Product
  onSelect: () => void
  isSelected?: boolean
  onToggleSelect?: () => void
  showCheckbox?: boolean
}

function ProductGridItem({ product, onSelect, isSelected = false, onToggleSelect, showCheckbox = false }: ProductItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  // Validate and clean image URL
  const getValidImageUrl = (imageData: any) => {
    if (!imageData || !imageData.src) return null;
    
    const url = imageData.src.trim();
    if (!url) return null;
    
    // Ensure the URL starts with http or https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }
    
    return url;
  }

  const imageUrl = getValidImageUrl(product.images?.[0]);

  // Debug logging for grid item images
  console.log('ProductGridItem Debug:', {
    productName: product.name,
    imageUrl,
    hasImages: product.images && Array.isArray(product.images) && product.images.length > 0,
    imageError,
    imageLoading,
    firstImage: product.images?.[0]
  });

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Grid image failed to load:', imageUrl, e);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Grid image loaded successfully:', imageUrl);
    setImageError(false);
    setImageLoading(false);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow relative" onClick={onSelect}>
      {/* Checkbox overlay */}
      {showCheckbox && (
        <div 
          className="absolute top-2 left-2 z-10"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect?.()
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <Square className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Image */}
          <div className="aspect-square relative">
            {imageUrl && !imageError ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center z-10">
                    <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  </div>
                )}
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className={`object-cover rounded-md transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  unoptimized={true}
                />
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
              <h3 className="font-medium text-sm line-clamp-2" title={product.name}>
                {product.name}
              </h3>
            {product.sku && (
              <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              {product.salePrice ? (
                <div>
                  <span className="text-sm font-medium text-red-600">
                    ${product.salePrice}
                  </span>
                  <span className="text-xs text-gray-500 line-through ml-1">
                    ${product.regularPrice}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium">
                  ${product.regularPrice || product.price || '0.00'}
                </span>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-1">
              <Badge className={`text-xs ${statusColors[product.status as keyof typeof statusColors]}`}>
                {product.status}
              </Badge>
              <Badge className={`text-xs ${stockStatusColors[product.stockStatus as keyof typeof stockStatusColors]}`}>
                {product.stockStatus.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
              <Badge className={`text-xs ${typeColors[product.type as keyof typeof typeColors]}`}>
                {product.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductListItem({ product, onSelect, isSelected = false, onToggleSelect, showCheckbox = false }: ProductItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  // Validate and clean image URL
  const getValidImageUrl = (imageData: any) => {
    if (!imageData || !imageData.src) return null;
    
    const url = imageData.src.trim();
    if (!url) return null;
    
    // Ensure the URL starts with http or https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }
    
    return url;
  }

  const imageUrl = getValidImageUrl(product.images?.[0]);

  // Debug logging for list item images
  console.log('ProductListItem Debug:', {
    productName: product.name,
    hasImages: product.images && Array.isArray(product.images) && product.images.length > 0,
    imageUrl,
    imageError,
    imageLoading,
    firstImage: product.images?.[0]
  });

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('List image failed to load:', imageUrl, e);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('List image loaded successfully:', imageUrl);
    setImageError(false);
    setImageLoading(false);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow relative" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Checkbox */}
          {showCheckbox && (
            <div 
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelect?.()
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          )}
          
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="h-16 w-16 relative">
              {imageUrl && !imageError ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className={`h-16 w-16 object-cover rounded-md transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg truncate" title={product.name}>
                  {product.name}
                </h3>
                
                {product.sku && (
                  <p className="text-sm text-gray-500 font-mono mt-1">{product.sku}</p>
                )}

                {product.categories && product.categories.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {product.categories.map(c => c.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                {product.salePrice ? (
                  <div>
                    <div className="text-lg font-medium text-red-600">
                      ${product.salePrice}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      ${product.regularPrice}
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-medium">
                    ${product.regularPrice || product.price || '0.00'}
                  </div>
                )}
              </div>
            </div>

            {/* Status and Meta Info */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={`text-xs ${statusColors[product.status as keyof typeof statusColors]}`}>
                  {product.status}
                </Badge>
                <Badge className={`text-xs ${stockStatusColors[product.stockStatus as keyof typeof stockStatusColors]}`}>
                  {product.stockStatus.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
                <Badge className={`text-xs ${typeColors[product.type as keyof typeof typeColors]}`}>
                  {product.type}
                  {product.type === 'variable' && product.variationsCount !== undefined && (
                    <span className="ml-1">({product.variationsCount})</span>
                  )}
                </Badge>
                {product.stockQuantity !== null && (
                  <Badge variant="outline" className="text-xs">
                    Stock: {product.stockQuantity}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Modified {new Date(product.dateModified).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
