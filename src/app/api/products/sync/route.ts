import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { masterProducts, productShops, shops } from '../../../../lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { WooCommerceClient } from '../../../../lib/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const batchSize = parseInt(searchParams.get('batchSize') || '50')
    const maxProducts = parseInt(searchParams.get('maxProducts') || '500')

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    const shopIdNum = parseInt(shopId)

    // Get shop details
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, shopIdNum))
      .limit(1)

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const wooClient = new WooCommerceClient(shop)

    try {
      await wooClient.testConnection()
    } catch (error) {
      console.error('WooCommerce connection failed:', error)
      return NextResponse.json(
        { error: 'Failed to connect to WooCommerce store' },
        { status: 400 }
      )
    }

    let page = 1
    let processedProducts = 0
    let syncedProducts = 0
    let updatedProducts = 0

    while (processedProducts < maxProducts) {
      const remaining = maxProducts - processedProducts
      const currentBatch = Math.min(batchSize, remaining)

      const { products: wooProducts } = await wooClient.getProducts({
        page,
        per_page: currentBatch,
        status: 'publish',
      })

      if (!wooProducts || wooProducts.length === 0) {
        break
      }

      for (const wooProduct of wooProducts) {
        const sku = wooProduct.sku || `woo-${wooProduct.id}`
        let [master] = await db
          .select()
          .from(masterProducts)
          .where(eq(masterProducts.sku, sku))
          .limit(1)

        if (!master) {
          ;[master] = await db
            .insert(masterProducts)
            .values({
              sku,
              name: wooProduct.name,
              description: wooProduct.description || '',
            })
            .returning()
        }

        const shopValues = {
          masterProductId: master.id,
          shopId: shopIdNum,
          price: wooProduct.price || wooProduct.regular_price || null,
          category: wooProduct.categories?.[0]?.name || null,
          stockQuantity: wooProduct.stock_quantity || null,
          stockStatus: wooProduct.stock_status,
          isActive: wooProduct.status === 'publish',
          updatedAt: new Date(),
        }

        const existing = await db
          .select()
          .from(productShops)
          .where(
            and(
              eq(productShops.masterProductId, master.id),
              eq(productShops.shopId, shopIdNum)
            )
          )
          .limit(1)

        if (existing.length > 0) {
          await db
            .update(productShops)
            .set(shopValues)
            .where(eq(productShops.id, existing[0].id))
          updatedProducts++
        } else {
          await db
            .insert(productShops)
            .values({ ...shopValues, createdAt: new Date() })
          syncedProducts++
        }
      }

      processedProducts += wooProducts.length
      page++
      await new Promise((r) => setTimeout(r, 1000))
    }

    await db
      .update(shops)
      .set({ lastPing: new Date(), status: 'online', updatedAt: new Date() })
      .where(eq(shops.id, shopIdNum))

    return NextResponse.json({
      success: true,
      message: `Products synchronized successfully (limited to ${maxProducts} products)`,
      stats: {
        processedProducts,
        syncedProducts,
        updatedProducts,
        maxProducts,
        hasMore: processedProducts >= maxProducts,
      },
    })
  } catch (error) {
    console.error('Error synchronizing products:', error)
    return NextResponse.json(
      { error: 'Failed to synchronize products' },
      { status: 500 }
    )
  }
}
