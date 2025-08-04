'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface CreateProductProps {
  isOpen: boolean
  onClose: () => void
  shopId: number
}

interface ProductFormData {
  name: string
  sku: string
  description: string
  shortDescription: string
  regularPrice: string
  salePrice: string
  stockQuantity: string
  stockStatus: string
  status: string
  type: string
  weight: string
  categories: string[]
  tags: string[]
}

export function CreateProduct({ isOpen, onClose, shopId }: CreateProductProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    regularPrice: '',
    salePrice: '',
    stockQuantity: '',
    stockStatus: 'instock',
    status: 'publish',
    type: 'simple',
    weight: '',
    categories: [],
    tags: []
  })
  
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      return
    }
    
    if (!formData.sku.trim()) {
      toast.error('SKU is required')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          shopId,
          stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
          regularPrice: formData.regularPrice ? parseFloat(formData.regularPrice) : null,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create product')
      }

      const product = await response.json()
      toast.success('Product created successfully')
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        sku: '',
        description: '',
        shortDescription: '',
        regularPrice: '',
        salePrice: '',
        stockQuantity: '',
        stockStatus: 'instock',
        status: 'publish',
        type: 'simple',
        weight: '',
        categories: [],
        tags: []
      })
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      shortDescription: '',
      regularPrice: '',
      salePrice: '',
      stockQuantity: '',
      stockStatus: 'instock',
      status: 'publish',
      type: 'simple',
      weight: '',
      categories: [],
      tags: []
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter unique SKU"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief product description"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Product Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple Product</SelectItem>
                      <SelectItem value="variable">Variable Product</SelectItem>
                      <SelectItem value="grouped">Grouped Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stockStatus">Stock Status</Label>
                  <Select value={formData.stockStatus} onValueChange={(value) => handleInputChange('stockStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instock">In Stock</SelectItem>
                      <SelectItem value="outofstock">Out of Stock</SelectItem>
                      <SelectItem value="onbackorder">On Backorder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="regularPrice">Regular Price</Label>
                  <Input
                    id="regularPrice"
                    type="number"
                    step="0.01"
                    value={formData.regularPrice}
                    onChange={(e) => handleInputChange('regularPrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
              Reset
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
