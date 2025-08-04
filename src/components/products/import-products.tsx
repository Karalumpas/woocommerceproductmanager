'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'

interface ImportProductsProps {
  isOpen: boolean
  onClose: () => void
  shopId: number
}

export function ImportProducts({ isOpen, onClose, shopId }: ImportProductsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'parent' | 'variations'>('parent')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
      } else {
        toast.error('Please select a CSV file')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
      } else {
        toast.error('Please select a CSV file')
      }
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('shopId', shopId.toString())
      formData.append('type', importType)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const result = await response.json()
      
      toast.success(`Import started successfully. Batch ID: ${result.batchId}`)
      onClose()
      
    } catch (error) {
      toast.error('Import failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleReset = () => {
    setFile(null)
    setImportType('parent')
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Products from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Import Type Selection */}
          <div>
            <Label htmlFor="importType">Import Type</Label>
            <Select value={importType} onValueChange={(value: 'parent' | 'variations') => setImportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent Products</SelectItem>
                <SelectItem value="variations">Product Variations</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {importType === 'parent' 
                ? 'Import main products with basic information'
                : 'Import variations for existing variable products'
              }
            </p>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : file 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{file.name}</p>
                  <p className="text-sm text-green-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to select a file
                </p>
                <Button variant="outline" disabled={isUploading}>
                  Select CSV File
                </Button>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* CSV Format Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                CSV Format Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                {importType === 'parent' ? (
                  <div>
                    <p className="font-medium mb-2">Required columns for parent products:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li><code>post_title</code> - Product name</li>
                      <li><code>sku</code> - Product SKU</li>
                      <li><code>regular_price</code> - Regular price</li>
                      <li><code>stock_status</code> - instock, outofstock, onbackorder</li>
                    </ul>
                    <p className="mt-2 font-medium">Optional columns:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li><code>post_content</code> - Description</li>
                      <li><code>post_excerpt</code> - Short description</li>
                      <li><code>sale_price</code> - Sale price</li>
                      <li><code>images</code> - Image URLs (pipe separated)</li>
                      <li><code>tax_product_cat</code> - Categories (pipe separated)</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-2">Required columns for variations:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li><code>parent_sku</code> - Parent product SKU</li>
                      <li><code>sku</code> - Variation SKU</li>
                      <li><code>regular_price</code> - Regular price</li>
                    </ul>
                    <p className="mt-2 font-medium">Optional columns:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li><code>sale_price</code> - Sale price</li>
                      <li><code>stock_status</code> - Stock status</li>
                      <li><code>meta_attribute_Colour</code> - Color attribute</li>
                      <li><code>meta_attribute_Size</code> - Size attribute</li>
                      <li><code>images</code> - Image URL</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isUploading}>
              Reset
            </Button>
            <Button onClick={handleImport} disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Start Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
