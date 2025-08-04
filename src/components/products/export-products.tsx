'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ExportProductsProps {
  isOpen: boolean
  onClose: () => void
  shopId: number
}

export function ExportProducts({ isOpen, onClose, shopId }: ExportProductsProps) {
  const [exportType, setExportType] = useState<'all' | 'parent' | 'variations'>('all')
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv')
  const [includeImages, setIncludeImages] = useState(true)
  const [includeVariations, setIncludeVariations] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const params = new URLSearchParams({
        shopId: shopId.toString(),
        type: exportType,
        format,
        includeImages: includeImages.toString(),
        includeVariations: includeVariations.toString(),
      })

      const response = await fetch(`/api/products/export?${params}`)
      
      clearInterval(progressInterval)
      setExportProgress(100)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export completed successfully')
      onClose()
      
    } catch (error) {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const getExportDescription = () => {
    switch (exportType) {
      case 'all':
        return 'Export all products including parent products and their variations'
      case 'parent':
        return 'Export only parent products without variation details'
      case 'variations':
        return 'Export only product variations with their parent references'
      default:
        return ''
    }
  }

  const getEstimatedSize = () => {
    // This would normally come from an API call
    const baseSize = exportType === 'all' ? 150 : exportType === 'parent' ? 75 : 50
    return includeImages ? baseSize * 1.5 : baseSize
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type Selection */}
          <div>
            <Label htmlFor="exportType">Export Type</Label>
            <Select value={exportType} onValueChange={(value: 'all' | 'parent' | 'variations') => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="parent">Parent Products Only</SelectItem>
                <SelectItem value="variations">Variations Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {getExportDescription()}
            </p>
          </div>

          {/* Format Selection */}
          <div>
            <Label htmlFor="format">File Format</Label>
            <Select value={format} onValueChange={(value: 'csv' | 'xlsx') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Choose the format for your exported file
            </p>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="includeImages">Include Image URLs</Label>
                  <p className="text-sm text-gray-600">Export product image URLs</p>
                </div>
                <input
                  type="checkbox"
                  id="includeImages"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </div>

              {exportType === 'all' && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeVariations">Include Variation Details</Label>
                    <p className="text-sm text-gray-600">Include detailed variation information</p>
                  </div>
                  <input
                    type="checkbox"
                    id="includeVariations"
                    checked={includeVariations}
                    onChange={(e) => setIncludeVariations(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Exporting products...</span>
                    <span className="text-sm text-gray-500">{Math.round(exportProgress)}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Export Type:</span>
                  <p className="font-medium capitalize">{exportType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Format:</span>
                  <p className="font-medium uppercase">{format}</p>
                </div>
                <div>
                  <span className="text-gray-600">Estimated Size:</span>
                  <p className="font-medium">~{Math.round(getEstimatedSize())} KB</p>
                </div>
                <div>
                  <span className="text-gray-600">Includes Images:</span>
                  <p className="font-medium">{includeImages ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Column Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Exported Columns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p className="font-medium">Standard columns:</p>
                <div className="grid grid-cols-2 gap-1 text-gray-600">
                  <span>• Product Name</span>
                  <span>• SKU</span>
                  <span>• Regular Price</span>
                  <span>• Sale Price</span>
                  <span>• Stock Status</span>
                  <span>• Stock Quantity</span>
                  <span>• Description</span>
                  <span>• Short Description</span>
                  <span>• Categories</span>
                  <span>• Product Type</span>
                  <span>• Status</span>
                  <span>• Date Modified</span>
                </div>
                {includeImages && (
                  <p className="text-gray-600 mt-2">• Image URLs</p>
                )}
                {(exportType === 'all' || exportType === 'variations') && includeVariations && (
                  <p className="text-gray-600 mt-2">• Variation attributes and details</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Start Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
