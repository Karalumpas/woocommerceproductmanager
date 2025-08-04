import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { shops } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { WooCommerceClient } from '../../../lib/woocommerce'

export async function GET(request: NextRequest) {
  try {
    // Hent første shop
    const [shop] = await db
      .select()
      .from(shops)
      .limit(1)

    if (!shop) {
      return NextResponse.json({ error: 'No shops found' }, { status: 404 })
    }

    // Initialiser WooCommerce klient
    const wooClient = new WooCommerceClient(shop)

    // Test forbindelse
    try {
      await wooClient.testConnection()
    } catch (error) {
      console.error('WooCommerce connection failed:', error)
      return NextResponse.json(
        { error: 'Failed to connect to WooCommerce store' },
        { status: 400 }
      )
    }

    // Hent et produkt og en variation for at se alle kolonner
    const { products } = await wooClient.getProducts({ per_page: 1 })
    
    let variationData = null
    if (products && products.length > 0 && products[0].type === 'variable' && products[0].variations && products[0].variations.length > 0) {
      const variation = await wooClient.getVariation(products[0].id, products[0].variations[0])
      variationData = variation
    }

    return NextResponse.json({
      success: true,
      product: products && products.length > 0 ? products[0] : null,
      variation: variationData,
      shopId: shop.id
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Failed to test WooCommerce API' },
      { status: 500 }
    )
  }
}
