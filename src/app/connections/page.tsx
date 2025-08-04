'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { useShops } from '@/hooks/use-shops'
import { WooCommerceClient } from '@/lib/woocommerce'
import type { Shop } from '@/lib/db/schema'

interface ShopFormData {
  name: string
  baseUrl: string
  consumerKey: string
  consumerSecret: string
}

export default function ConnectionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    baseUrl: '',
    consumerKey: '',
    consumerSecret: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testingConnection, setTestingConnection] = useState<number | null>(null)
  
  const { selectedShop, setSelectedShop } = useAppStore()
  const { shops, isLoading, createShop, updateShop, deleteShop, testShopConnection } = useShops()

  const resetForm = () => {
    setFormData({
      name: '',
      baseUrl: '',
      consumerKey: '',
      consumerSecret: '',
    })
    setEditingShop(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingShop) {
        await updateShop(editingShop.id, formData)
      } else {
        await createShop(formData)
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Failed to save shop:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop)
    setFormData({
      name: shop.name,
      baseUrl: shop.baseUrl,
      consumerKey: shop.consumerKey,
      consumerSecret: shop.consumerSecret,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (shopId: number) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      try {
        await deleteShop(shopId)
        if (selectedShop?.id === shopId) {
          setSelectedShop(null)
        }
      } catch (error) {
        console.error('Failed to delete shop:', error)
      }
    }
  }

  const handleTestConnection = async (shop: Shop) => {
    setTestingConnection(shop.id)
    try {
      await testShopConnection(shop.id)
    } finally {
      setTestingConnection(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WooCommerce Connections</h1>
          <p className="text-muted-foreground">
            Manage your WooCommerce store connections
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingShop ? 'Edit Connection' : 'Add Connection'}
              </DialogTitle>
              <DialogDescription>
                Enter your WooCommerce store details to create a connection.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    placeholder="My Store"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="baseUrl">Store URL</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://yourstore.com"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="consumerKey">Consumer Key</Label>
                  <Input
                    id="consumerKey"
                    placeholder="ck_xxxxxxxxxxxxxxxx"
                    value={formData.consumerKey}
                    onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="consumerSecret">Consumer Secret</Label>
                  <Input
                    id="consumerSecret"
                    type="password"
                    placeholder="cs_xxxxxxxxxxxxxxxx"
                    value={formData.consumerSecret}
                    onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {editingShop ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingShop ? 'Update' : 'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {shops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No connections yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first WooCommerce store connection.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <Card
              key={shop.id}
              className={`transition-all cursor-pointer hover:shadow-md ${
                selectedShop?.id === shop.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedShop(shop)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{shop.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(shop.status || 'unknown')}
                    <span className="text-sm text-muted-foreground">
                      {getStatusText(shop.status || 'unknown')}
                    </span>
                  </div>
                </div>
                <CardDescription>{shop.baseUrl}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTestConnection(shop)
                      }}
                      disabled={testingConnection === shop.id}
                    >
                      {testingConnection === shop.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-1 h-3 w-3" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(shop)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(shop.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {selectedShop?.id === shop.id && (
                    <div className="text-xs text-primary font-medium">
                      Selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
