'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '../../lib/store'

export default function TestImagesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [imageLoadStatus, setImageLoadStatus] = useState<{[key: string]: 'loading' | 'loaded' | 'error'}>({})
  const { selectedShop, setSelectedShop } = useAppStore()

  useEffect(() => {
    // Auto-select first shop if none selected
    if (!selectedShop) {
      fetch('/api/shops')
        .then(res => res.json())
        .then(shops => {
          if (shops.length > 0) {
            setSelectedShop(shops[0])
          }
        })
    }
  }, [selectedShop, setSelectedShop])

  useEffect(() => {
    if (selectedShop) {
      fetch(`/api/products?shopId=${selectedShop.id}&limit=5`)
        .then(res => res.json())
        .then(data => {
          console.log('Fetched products:', data)
          setProducts(data.products || [])
          setLoading(false)
        })
        .catch(error => {
          console.error('Error fetching products:', error)
          setLoading(false)
        })
    }
  }, [selectedShop])

  const handleImageLoad = (productId: number, imageUrl: string) => {
    setImageLoadStatus(prev => ({ ...prev, [`${productId}-${imageUrl}`]: 'loaded' }))
    console.log('Image loaded successfully:', imageUrl)
  }

  const handleImageError = (productId: number, imageUrl: string, error: any) => {
    setImageLoadStatus(prev => ({ ...prev, [`${productId}-${imageUrl}`]: 'error' }))
    console.error('Image failed to load:', imageUrl, error)
  }

  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return { status: response.status, ok: response.ok }
    } catch (error) {
      return { status: 'error', ok: false, error }
    }
  }

  if (!selectedShop) return <div>Setting up shop...</div>
  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Test Page</h1>
      <p>Selected shop: {selectedShop.name}</p>
      
      {products.map(product => (
        <div key={product.id} className="border p-4 mb-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p>Product ID: {product.id}</p>
          <p>Images array length: {product.images?.length || 0}</p>
          
          {product.images && product.images.length > 0 ? (
            <div className="mt-2">
              <p>First image src: <code className="bg-gray-100 p-1">{product.images[0].src}</code></p>
              
              <div className="mt-2">
                <button 
                  onClick={() => testImageUrl(product.images[0].src).then(result => console.log('URL test result:', result))}
                  className="bg-blue-500 text-white px-2 py-1 text-sm rounded"
                >
                  Test URL
                </button>
              </div>
              
              <div className="mt-2">
                <p>Status: {imageLoadStatus[`${product.id}-${product.images[0].src}`] || 'not loaded'}</p>
                <img 
                  src={product.images[0].src} 
                  alt={product.name}
                  className="w-32 h-32 object-cover border"
                  onLoad={() => handleImageLoad(product.id, product.images[0].src)}
                  onError={(e) => handleImageError(product.id, product.images[0].src, e)}
                />
              </div>
              
              {/* Direct link test */}
              <div className="mt-2">
                <a 
                  href={product.images[0].src} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Open image in new tab
                </a>
              </div>
            </div>
          ) : (
            <p>No images found</p>
          )}
        </div>
      ))}
    </div>
  )
}
