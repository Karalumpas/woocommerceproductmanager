import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, shops } from '@/lib/db/schema'
import { eq, count, avg, sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = parseInt(params.id)
    
    if (isNaN(shopId)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 })
    }

    // Verify shop exists
    const shop = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1)
    if (shop.length === 0) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    // Get all products for this shop
    const shopProducts = await db.select().from(products).where(eq(products.shopId, shopId))

    // Calculate statistics
    const totalProducts = shopProducts.length
    const outOfStockCount = shopProducts.filter(p => p.stockStatus === 'outofstock').length
    const averagePrice = shopProducts.length > 0 
      ? shopProducts.reduce((sum, p) => sum + (parseFloat(p.price?.toString() || '0') || 0), 0) / shopProducts.length
      : 0

    // Count by stock status
    const stockStatus = {
      inStock: shopProducts.filter(p => p.stockStatus === 'instock').length,
      outOfStock: shopProducts.filter(p => p.stockStatus === 'outofstock').length,
      onBackorder: shopProducts.filter(p => p.stockStatus === 'onbackorder').length
    }

    // Simple top categories (from products that have categories)
    const categoryCount: Record<string, number> = {}
    shopProducts.forEach(product => {
      if (product.categories) {
        try {
          const cats = typeof product.categories === 'string' 
            ? JSON.parse(product.categories) 
            : product.categories
          if (Array.isArray(cats)) {
            cats.forEach((cat: any) => {
              const name = cat.name || 'Unknown'
              categoryCount[name] = (categoryCount[name] || 0) + 1
            })
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    })

    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const stats = {
      totalProducts,
      totalVariations: 0, // Could be calculated from variations table
      outOfStockCount,
      averagePrice: Math.round(averagePrice * 100) / 100,
      lastUpdated: new Date().toISOString(),
      productsTrend: 0,
      variationsTrend: 0,
      outOfStockTrend: 0,
      priceTrend: 0,
      topCategories,
      stockStatus,
      recentActivity: [
        {
          description: `Found ${totalProducts} products in shop`,
          timestamp: new Date().toISOString()
        }
      ]
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
