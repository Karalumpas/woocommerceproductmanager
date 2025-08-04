'use client'

import { useState } from 'react'
import { RefreshCw, Settings, Play, Pause, CheckCircle, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Progress } from '../ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { syncShopProducts } from '../../lib/hooks/use-products'
import { toast } from '../../lib/hooks/use-toast'

interface SyncProgressProps {
  shopId: number
  shopName: string
  onSyncComplete: () => void
}

export function SyncProgress({ shopId, shopName, onSyncComplete }: SyncProgressProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [syncStats, setSyncStats] = useState({
    syncedProducts: 0,
    updatedProducts: 0,
    totalProducts: 0,
  })
  
  // Konfiguration
  const [maxProducts, setMaxProducts] = useState(500)
  const [batchSize, setBatchSize] = useState(50)

  const handleStartSync = async () => {
    setIsSyncing(true)
    setIsPaused(false)
    setProgress(0)
    setCurrentBatch(0)
    setSyncStats({ syncedProducts: 0, updatedProducts: 0, totalProducts: 0 })
    
    const estimatedBatches = Math.ceil(maxProducts / batchSize)
    setTotalBatches(estimatedBatches)

    try {
      // Start første batch
      await performBatchSync()
    } catch (error: any) {
      toast({
        title: "Synkroniseringsfejl",
        description: error.message || "Der opstod en fejl under synkronisering",
        variant: "destructive",
      })
      setIsSyncing(false)
    }
  }

  const performBatchSync = async () => {
    try {
      // Call sync API with batch parameters
      const response = await fetch(`/api/products/sync?shopId=${shopId}&batchSize=${batchSize}&maxProducts=${maxProducts}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Synkronisering mislykkedes')
      }

      const result = await response.json()
      
      // Update progress
      const progressPercentage = (result.stats.processedProducts / maxProducts) * 100
      setProgress(Math.min(progressPercentage, 100))
      setCurrentBatch(Math.ceil(result.stats.processedProducts / batchSize))
      setSyncStats({
        syncedProducts: result.stats.syncedProducts,
        updatedProducts: result.stats.updatedProducts,
        totalProducts: result.stats.processedProducts,
      })

      if (result.stats.processedProducts >= maxProducts || !result.stats.hasMore) {
        // Sync completed
        setIsSyncing(false)
        toast({
          title: "Synkronisering fuldført",
          description: `${result.stats.syncedProducts} nye produkter hentet, ${result.stats.updatedProducts} produkter opdateret`,
        })
        onSyncComplete()
      }

    } catch (error: any) {
      throw error
    }
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    setIsSyncing(false)
    setIsPaused(false)
    setProgress(0)
    setCurrentBatch(0)
    setSyncStats({ syncedProducts: 0, updatedProducts: 0, totalProducts: 0 })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isSyncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synkroniserer...' : 'Synkroniser'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Synkroniser produkter fra {shopName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Konfiguration */}
          {!isSyncing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-4 w-4" />
                  Synkroniseringsindstillinger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxProducts">Maksimum produkter</Label>
                    <Input
                      id="maxProducts"
                      type="number"
                      value={maxProducts}
                      onChange={(e) => setMaxProducts(parseInt(e.target.value) || 500)}
                      min="50"
                      max="5000"
                      step="50"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Begrænser antal produkter for bedre performance
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="batchSize">Batch størrelse</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
                      min="10"
                      max="100"
                      step="10"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Antal produkter per batch (mindre = langsommere men mere stabilt)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {isSyncing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Synkroniseringsfremgang</span>
                  <Badge variant={isPaused ? "secondary" : "default"}>
                    {isPaused ? 'Pauset' : 'Kører'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overordnet fremgang</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">{syncStats.syncedProducts}</div>
                    <div className="text-sm text-muted-foreground">Nye produkter</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">{syncStats.updatedProducts}</div>
                    <div className="text-sm text-muted-foreground">Opdaterede</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{syncStats.totalProducts}</div>
                    <div className="text-sm text-muted-foreground">Behandlede</div>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Batch {currentBatch} af {totalBatches} (max {maxProducts} produkter)
                </div>
              </CardContent>
            </Card>
          )}

          {/* Kontrolknapper */}
          <div className="flex justify-between">
            {!isSyncing ? (
              <div className="flex gap-2">
                <Button onClick={handleStartSync} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start synkronisering
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annuller
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePauseResume}
                  className="flex items-center gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      Genoptag
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleStop}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
