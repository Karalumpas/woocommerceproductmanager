import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { products, variations, shops } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { WooCommerceClient } from '../../../../lib/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    // Get shop details
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, parseInt(shopId)))
      .limit(1)

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    // Initialize WooCommerce client
    const wooClient = new WooCommerceClient(shop)

    // Test connection first
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
    let totalProducts = 0
    let syncedProducts = 0
    let updatedProducts = 0
    const batchSize = 20

    while (true) {
      try {
        // Fetch products from WooCommerce
        const { products: wooProducts } = await wooClient.getProducts({
          page,
          per_page: batchSize,
          status: 'any', // Get all products regardless of status
        })

        if (!wooProducts || wooProducts.length === 0) {
          break // No more products
        }

        totalProducts += wooProducts.length

        // Process each product
        for (const wooProduct of wooProducts) {
          try {
            // Check if product already exists
            const [existingProduct] = await db
              .select()
              .from(products)
              .where(eq(products.wooId, wooProduct.id))
              .limit(1)

            const productData = {
              shopId: parseInt(shopId),
              wooId: wooProduct.id,
              name: wooProduct.name,
              slug: wooProduct.slug,
              type: wooProduct.type,
              status: wooProduct.status,
              sku: wooProduct.sku || '',
              description: wooProduct.description || '',
              shortDescription: wooProduct.short_description || '',
              price: wooProduct.price || null,
              regularPrice: wooProduct.regular_price || null,
              salePrice: wooProduct.sale_price || null,
              stockStatus: wooProduct.stock_status || 'instock',
              stockQuantity: wooProduct.stock_quantity || null,
              manageStock: wooProduct.manage_stock || false,
              weight: wooProduct.weight || null,
              dimensions: wooProduct.dimensions ? JSON.stringify(wooProduct.dimensions) : null,
              images: wooProduct.images ? JSON.stringify(wooProduct.images) : null,
              categories: wooProduct.categories ? JSON.stringify(wooProduct.categories) : null,
              tags: wooProduct.tags ? JSON.stringify(wooProduct.tags) : null,
              attributes: wooProduct.attributes ? JSON.stringify(wooProduct.attributes) : null,
              dateCreated: new Date(wooProduct.date_created),
              dateModified: new Date(wooProduct.date_modified),
            }

            if (existingProduct) {
              // Update existing product
              await db
                .update(products)
                .set({
                  ...productData,
                  updatedAt: new Date(),
                })
                .where(eq(products.id, existingProduct.id))
              updatedProducts++
            } else {
              // Insert new product
              const [newProduct] = await db
                .insert(products)
                .values(productData)
                .returning()

              syncedProducts++

              // Sync variations if it's a variable product
              if (wooProduct.type === 'variable' && wooProduct.variations && wooProduct.variations.length > 0) {
                for (const variationId of wooProduct.variations) {
                  try {
                    const variation = await wooClient.getVariation(wooProduct.id, variationId)
                    
                    await db.insert(variations).values({
                      shopId: parseInt(shopId),
                      wooId: variation.id,
                      wooParentId: wooProduct.id,
                      productId: newProduct.id,
                      sku: variation.sku || '',
                      price: variation.price || null,
                      regularPrice: variation.regular_price || null,
                      salePrice: variation.sale_price || null,
                      stockStatus: variation.stock_status || 'instock',
                      stockQuantity: variation.stock_quantity || null,
                      manageStock: variation.manage_stock || false,
                      weight: variation.weight || null,
                      dimensions: variation.dimensions ? JSON.stringify(variation.dimensions) : null,
                      image: variation.image ? JSON.stringify(variation.image) : null,
                      attributes: variation.attributes ? JSON.stringify(variation.attributes) : null,
                      dateCreated: new Date(variation.date_created),
                      dateModified: new Date(variation.date_modified),
                    })
                  } catch (variationError) {
                    console.error(`Error syncing variation ${variationId}:`, variationError)
                    // Continue with next variation
                  }
                }
              }
            }
          } catch (productError) {
            console.error(`Error processing product ${wooProduct.id}:`, productError)
            // Continue with next product
          }
        }

        page++

        // Add a small delay to avoid overwhelming the WooCommerce API
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (pageError) {
        console.error(`Error fetching page ${page}:`, pageError)
        break
      }
    }

    // Update shop's last ping (since we don't have lastSync field)
    await db
      .update(shops)
      .set({
        lastPing: new Date(),
        status: 'online',
        updatedAt: new Date(),
      })
      .where(eq(shops.id, parseInt(shopId)))

    return NextResponse.json({
      success: true,
      message: 'Products synchronized successfully',
      stats: {
        totalProducts,
        syncedProducts,
        updatedProducts,
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
