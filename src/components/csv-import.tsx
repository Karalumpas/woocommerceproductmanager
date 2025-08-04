'use client'

import { useState, useRef } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { createImportBatch, useImportBatches, useImportBatch, cancelImportBatch } from '../lib/hooks/use-imports'
import { useToast } from '../lib/hooks/use-toast'
import { Upload, FileText, X, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

interface CSVImportDialogProps {
  children: React.ReactNode
}

export function CSVImportDialog({ children }: CSVImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<'parent' | 'variations'>('parent')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { mutate } = useImportBatches()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file.',
          variant: 'destructive',
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      await createImportBatch(file, type)
      toast({
        title: 'Import started',
        description: `CSV import for ${type} products has been queued.`,
      })
      setOpen(false)
      setFile(null)
      mutate() // Refresh the imports list
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to start import',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import products or variations into your WooCommerce store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Import Type</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={type === 'parent' ? 'default' : 'outline'}
                onClick={() => setType('parent')}
                className="flex-1"
              >
                Parent Products
              </Button>
              <Button
                type="button"
                variant={type === 'variations' ? 'default' : 'outline'}
                onClick={() => setType('variations')}
                className="flex-1"
              >
                Variations
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                file ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-gray-400"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-green-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div>
                    <p className="font-medium">Click to select CSV file</p>
                    <p className="text-sm text-gray-500">or drag and drop here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p className="font-medium mb-1">CSV Format:</p>
            {type === 'parent' ? (
              <ul className="text-xs space-y-1">
                <li>• Required: post_title, sku</li>
                <li>• Optional: post_content, post_excerpt, regular_price, stock_status</li>
                <li>• Categories: tax_product_cat (pipe-separated)</li>
              </ul>
            ) : (
              <ul className="text-xs space-y-1">
                <li>• Required: parent_sku, sku</li>
                <li>• Optional: regular_price, stock_status, images</li>
                <li>• Attributes: meta_attribute_Colour, meta_attribute_Size</li>
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ImportBatchListProps {
  className?: string
}

export function ImportBatchList({ className }: ImportBatchListProps) {
  const { batches, isLoading } = useImportBatches()
  const { toast } = useToast()

  const handleCancel = async (batchId: number) => {
    try {
      await cancelImportBatch(batchId)
      toast({
        title: 'Import cancelled',
        description: 'The import has been cancelled successfully.',
      })
    } catch (error) {
      toast({
        title: 'Cancel failed',
        description: error instanceof Error ? error.message : 'Failed to cancel import',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (batches.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No imports yet</p>
        <p className="text-sm">Start by uploading a CSV file</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {batches.map((batch: any) => (
        <ImportBatchItem key={batch.id} batch={batch} onCancel={handleCancel} />
      ))}
    </div>
  )
}

interface ImportBatchItemProps {
  batch: any
  onCancel: (batchId: number) => void
}

function ImportBatchItem({ batch, onCancel }: ImportBatchItemProps) {
  const statusIcons = {
    pending: Clock,
    processing: Loader2,
    completed: CheckCircle,
    failed: AlertCircle,
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  const Icon = statusIcons[batch.status as keyof typeof statusIcons]
  const progress = batch.totalRows > 0 ? (batch.processedRows / batch.totalRows) * 100 : 0

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon
            className={cn(
              "h-5 w-5",
              batch.status === 'processing' && "animate-spin"
            )}
          />
          <div>
            <p className="font-medium">{batch.filename}</p>
            <p className="text-sm text-gray-500">
              {batch.type} • {new Date(batch.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[batch.status as keyof typeof statusColors]}>
            {batch.status}
          </Badge>
          {['pending', 'processing'].includes(batch.status) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCancel(batch.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {batch.status === 'processing' && batch.totalRows > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{batch.processedRows}/{batch.totalRows}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {batch.status === 'completed' && (
        <div className="text-sm text-gray-600">
          <span className="text-green-600 font-medium">{batch.successfulRows}</span> successful
          {batch.errorRows > 0 && (
            <span>, <span className="text-red-600 font-medium">{batch.errorRows}</span> errors</span>
          )}
        </div>
      )}

      {batch.status === 'failed' && batch.errors && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {batch.errors[0]?.message || 'Import failed'}
        </div>
      )}
    </div>
  )
}
