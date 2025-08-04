'use client'

import { useState, useEffect } from 'react'

export default function DebugImagesPage() {
  const [imageData, setImageData] = useState<any>(null)

  useEffect(() => {
    // Test with the exact URLs we're seeing in the console
    const testUrls = [
      'https://medeland.dk/wp-content/uploads/YP260_LS00_2025.jpg',
      'https://medeland.dk/wp-content/uploads/YP259_LS00_2025.jpg'
    ]

    setImageData({
      urls: testUrls,
      loadStatus: testUrls.reduce((acc, url) => ({ ...acc, [url]: 'loading' }), {})
    })
  }, [])

  const handleImageLoad = (url: string) => {
    console.log('✅ Image loaded successfully:', url)
    setImageData((prev: any) => ({
      ...prev,
      loadStatus: { ...prev.loadStatus, [url]: 'loaded' }
    }))
  }

  const handleImageError = (url: string, e: any) => {
    console.error('❌ Image failed to load:', url, e)
    setImageData((prev: any) => ({
      ...prev,
      loadStatus: { ...prev.loadStatus, [url]: 'error' }
    }))
  }

  if (!imageData) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Image Debug Page</h1>
      
      <div className="space-y-6">
        {imageData.urls.map((url: string, index: number) => (
          <div key={url} className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Image {index + 1}</h3>
            <p className="text-sm text-gray-600 mb-2 break-all">URL: {url}</p>
            <p className="text-sm mb-4">Status: <span className={`font-bold ${
              imageData.loadStatus[url] === 'loaded' ? 'text-green-600' : 
              imageData.loadStatus[url] === 'error' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>{imageData.loadStatus[url]}</span></p>
            
            <div className="border-2 border-dashed border-gray-300 p-4 mb-4 text-center">
              <img
                src={url}
                alt={`Test image ${index + 1}`}
                className="max-w-full max-h-64 mx-auto"
                onLoad={() => handleImageLoad(url)}
                onError={(e) => handleImageError(url, e)}
              />
            </div>

            {/* Try as background image too */}
            <div className="border-2 border-dashed border-gray-300 p-4 text-center">
              <div 
                className="w-32 h-32 mx-auto bg-cover bg-center border"
                style={{ backgroundImage: `url(${url})` }}
              />
              <p className="text-xs text-gray-500 mt-2">Background image test</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Network Test</h3>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={async () => {
            for (const url of imageData.urls) {
              try {
                const response = await fetch(url, { method: 'HEAD' })
                console.log(`Network test for ${url}:`, {
                  status: response.status,
                  ok: response.ok,
                  headers: Object.fromEntries(response.headers.entries())
                })
              } catch (error) {
                console.error(`Network test failed for ${url}:`, error)
              }
            }
          }}
        >
          Test Network Access
        </button>
      </div>
    </div>
  )
}
