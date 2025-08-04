import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { products, shops } from '../../../../../lib/db/schema'
import { eq, sql } from 'drizzle-orm'

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

    // Get stock data for the shop
    const shopProducts = await db.select({
      id: products.id,
      name: products.name,
      stockStatus: products.stockStatus,
      stockQuantity: products.stockQuantity,
    })
    .from(products)
    .where(eq(products.shopId, shopId))

    // Group data by stock status
    const stockByStatus = {
      inStock: 0,
      outOfStock: 0,
      onBackorder: 0,
      unknown: 0
    }

    shopProducts.forEach(product => {
      switch(product.stockStatus) {
        case 'instock':
          stockByStatus.inStock++;
          break;
        case 'outofstock':
          stockByStatus.outOfStock++;
          break;
        case 'onbackorder':
          stockByStatus.onBackorder++;
          break;
        default:
          stockByStatus.unknown++;
      }
    });

    // Create data for chart in the format expected by the component
    const chartData = [
      { name: 'In Stock', value: stockByStatus.inStock },
      { name: 'Out of Stock', value: stockByStatus.outOfStock },
      { name: 'On Backorder', value: stockByStatus.onBackorder },
    ].filter(item => item.value > 0); // Only include non-zero values

    // Return the chart data directly as an array
    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Failed to fetch stock chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock chart data' },
      { status: 500 }
    )
  }
}
