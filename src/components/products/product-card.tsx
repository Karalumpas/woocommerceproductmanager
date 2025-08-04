'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Save, 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Package, 
  DollarSign,
  Layers,
  Settings,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { useToast } from '../../hooks/use-toast'

// Image component with fallback
interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallback: React.ReactNode
  onRemove?: () => void
}

function ImageWithFallback({ src, alt, className, fallback, onRemove }: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    console.error('Image failed to load:', src)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', src)
    setImageError(false)
    setImageLoading(false)
  }

  if (imageError || !src) {
    return <>{fallback}</>
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
        {onRemove && (
          <Button variant="destructive" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

interface FormData {
  name: string
  description: string
  shortDescription: string
  sku: string
  regularPrice: string
  salePrice: string
  stockQuantity: string
  stockStatus: string
  status: string
  type: string
  weight: string
  categories: any[]
  tags: any[]
  images: any[]
  attributes: any[]
  variations: any[]
}

export function ProductCard({ product, isOpen, onClose, onUpdate }: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    regularPrice: '',
    salePrice: '',
    stockQuantity: '',
    stockStatus: 'instock',
    status: 'publish',
    type: 'simple',
    weight: '',
    categories: [],
    tags: [],
    images: [],
    attributes: [],
    variations: []
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        sku: product.sku || '',
        regularPrice: product.regularPrice || '',
        salePrice: product.salePrice || '',
        stockQuantity: product.stockQuantity?.toString() || '',
        stockStatus: product.stockStatus || 'instock',
        status: product.status || 'publish',
        type: product.type || 'simple',
        weight: '', // Not available in Product interface
        categories: product.categories || [],
        tags: [], // Not available in Product interface
        images: product.images || [],
        attributes: product.attributes || [],
        variations: product.variations || []
      })
    }
  }, [product])

  const handleSave = async () => {
    try {
      // Update product via API
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          shortDescription: formData.shortDescription,
          sku: formData.sku,
          regularPrice: formData.regularPrice || null,
          salePrice: formData.salePrice || null,
          stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
          stockStatus: formData.stockStatus,
          status: formData.status,
          type: formData.type,
          categories: formData.categories,
          images: formData.images,
          attributes: formData.attributes,
          variations: formData.variations,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to update product:', error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleAddVariation = () => {
    const newVariation = {
      id: Date.now(),
      sku: '',
      regularPrice: '',
      salePrice: '',
      stockQuantity: '',
      stockStatus: 'instock',
      attributes: [],
      image: null
    }
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, newVariation]
    }))
  }

  const handleUpdateVariation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation: any, i: number) => 
        i === index ? { ...variation, [field]: value } : variation
      )
    }))
  }

  const handleDeleteVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }))
  }

  if (!product) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isEditing ? 'Edit Product' : product?.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                WooCommerce
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm mt-1">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    {isEditing ? (
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      />
                    ) : (
                      <Badge variant="outline" className="mt-1">
                        {formData.sku || 'No SKU'}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: formData.description }} />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      {isEditing ? (
                        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="publish">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="mt-1">
                          {formData.status}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      {isEditing ? (
                        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">Simple</SelectItem>
                            <SelectItem value="variable">Variable</SelectItem>
                            <SelectItem value="grouped">Grouped</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="mt-1">
                          {formData.type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="regularPrice">Regular Price</Label>
                      {isEditing ? (
                        <Input
                          id="regularPrice"
                          type="number"
                          step="0.01"
                          value={formData.regularPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, regularPrice: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm mt-1 font-medium">
                          ${formData.regularPrice || '0.00'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="salePrice">Sale Price</Label>
                      {isEditing ? (
                        <Input
                          id="salePrice"
                          type="number"
                          step="0.01"
                          value={formData.salePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm mt-1 font-medium text-red-600">
                          {formData.salePrice ? `$${formData.salePrice}` : 'No sale price'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="shortDescription"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: formData.shortDescription }} />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variations" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Product Variations
                  </h3>
                  {isEditing && (
                    <Button onClick={handleAddVariation} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variation
                    </Button>
                  )}
                </div>

                {formData.variations.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <Layers className="h-12 w-12 mx-auto mb-2" />
                        <p>No variations found</p>
                        {formData.type === 'variable' && (
                          <p className="text-sm">Add variations to this variable product</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {formData.variations.map((variation: any, index: number) => (
                      <Card key={variation.id || index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">
                              Variation {index + 1}
                              {variation.sku && ` - ${variation.sku}`}
                            </CardTitle>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVariation(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`var-sku-${index}`}>SKU</Label>
                              {isEditing ? (
                                <Input
                                  id={`var-sku-${index}`}
                                  value={variation.sku || ''}
                                  onChange={(e) => handleUpdateVariation(index, 'sku', e.target.value)}
                                />
                              ) : (
                                <Badge variant="outline" className="mt-1">
                                  {variation.sku || 'No SKU'}
                                </Badge>
                              )}
                            </div>

                            <div>
                              <Label htmlFor={`var-price-${index}`}>Regular Price</Label>
                              {isEditing ? (
                                <Input
                                  id={`var-price-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={variation.regularPrice || ''}
                                  onChange={(e) => handleUpdateVariation(index, 'regularPrice', e.target.value)}
                                />
                              ) : (
                                <p className="text-sm mt-1">${variation.regularPrice || '0.00'}</p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor={`var-sale-${index}`}>Sale Price</Label>
                              {isEditing ? (
                                <Input
                                  id={`var-sale-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={variation.salePrice || ''}
                                  onChange={(e) => handleUpdateVariation(index, 'salePrice', e.target.value)}
                                />
                              ) : (
                                <p className="text-sm mt-1 text-red-600">
                                  {variation.salePrice ? `$${variation.salePrice}` : 'No sale'}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor={`var-stock-${index}`}>Stock</Label>
                              {isEditing ? (
                                <Input
                                  id={`var-stock-${index}`}
                                  type="number"
                                  value={variation.stockQuantity || ''}
                                  onChange={(e) => handleUpdateVariation(index, 'stockQuantity', e.target.value)}
                                />
                              ) : (
                                <p className="text-sm mt-1">{variation.stockQuantity || 'No stock'}</p>
                              )}
                            </div>
                          </div>

                          {/* Variation Attributes */}
                          {variation.attributes && variation.attributes.length > 0 && (
                            <div className="mt-4">
                              <Label>Attributes</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {variation.attributes.map((attr: any, attrIndex: number) => (
                                  <Badge key={attrIndex} variant="secondary">
                                    {attr.name}: {attr.option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="images" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </h3>
                
                {formData.images.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                        <p>No images found</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image: any, index: number) => (
                      <ImageWithFallback
                        key={index}
                        src={image.src}
                        alt={image.alt || formData.name}
                        className="w-full h-32 object-cover rounded-lg border"
                        fallback={
                          <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        }
                        onRemove={isEditing ? () => handleRemoveImage(index) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attributes" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Product Attributes
                </h3>
                
                {formData.attributes.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <Settings className="h-12 w-12 mx-auto mb-2" />
                        <p>No attributes defined</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {formData.attributes.map((attribute: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{attribute.name}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {attribute.options?.map((option: string, optIndex: number) => (
                                  <Badge key={optIndex} variant="outline">
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {attribute.variation ? 'Used for variations' : 'For display only'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Management
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="stockStatus">Stock Status</Label>
                          {isEditing ? (
                            <Select value={formData.stockStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, stockStatus: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="instock">In Stock</SelectItem>
                                <SelectItem value="outofstock">Out of Stock</SelectItem>
                                <SelectItem value="onbackorder">On Backorder</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className="mt-1">
                              {formData.stockStatus.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="stockQuantity">Stock Quantity</Label>
                          {isEditing ? (
                            <Input
                              id="stockQuantity"
                              type="number"
                              value={formData.stockQuantity}
                              onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                            />
                          ) : (
                            <p className="text-sm mt-1">{formData.stockQuantity || 'Not tracked'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="weight">Weight</Label>
                          {isEditing ? (
                            <Input
                              id="weight"
                              value={formData.weight}
                              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                              placeholder="kg"
                            />
                          ) : (
                            <p className="text-sm mt-1">{formData.weight || 'Not specified'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {isEditing && (
          <div className="flex-shrink-0 flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
