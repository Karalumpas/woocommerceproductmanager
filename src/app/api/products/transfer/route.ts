import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { products, shops, productShopVariants } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { WooCommerceClient } from '../../../../lib/woocommerce'

export async function POST(request: NextRequest) {
  try {
    const { products: productsToTransfer, targetShopId, sourceShopId } = await request.json()

    if (!productsToTransfer || !Array.isArray(productsToTransfer) || productsToTransfer.length === 0) {
      return NextResponse.json({ error: 'Products array is required' }, { status: 400 })
    }

    if (!targetShopId) {
      return NextResponse.json({ error: 'Target shop ID is required' }, { status: 400 })
    }

    // Get target shop details
    const targetShop = await db.select().from(shops).where(eq(shops.id, targetShopId)).limit(1)
    if (targetShop.length === 0) {
      return NextResponse.json({ error: 'Target shop not found' }, { status: 404 })
    }

    const shop = targetShop[0]

    // Initialize WooCommerce API for target shop
    const api = new WooCommerceClient(shop)

    const results: Array<{
      success: boolean
      productId: number
      wooId?: number
      name: string
    }> = []
    
    const errors: Array<{
      productId: number
      name: string
      error: string
    }> = []

    for (const product of productsToTransfer) {
      try {
        // Get selected variants for this product if any
        const variantRows = await db
          .select()
          .from(productShopVariants)
          .where(eq(productShopVariants.productShopId, product.id))

        const selectedVariantIds = variantRows.map(v => v.variationId)
        const selectedVariations = selectedVariantIds.length
          ? product.variations?.filter((v: any) => selectedVariantIds.includes(v.id)) || []
          : product.variations || []

        // Prepare product data for WooCommerce
        const productData: any = {
          name: product.name,
          slug: product.slug,
          type: product.type,
          status: product.status,
          sku: product.sku,
          regular_price: product.regularPrice,
          sale_price: product.salePrice,
          stock_status: product.stockStatus,
          stock_quantity: product.stockQuantity,
          description: product.description,
          short_description: product.shortDescription,
          categories: product.categories?.map((cat: any) => ({ id: cat.id })) || [],
          images: product.images?.map((img: any) => ({ src: img.src, alt: img.alt })) || [],
          attributes: product.attributes || [],
        }

        if (selectedVariations.length > 0) {
          productData.variations = selectedVariations
        }

        // Check if product comes from CSV (no shopId or wooId)
        const isFromCSV = !product.shopId || !product.wooId

        let wooProduct
        if (isFromCSV) {
          // Create new product in target shop
          wooProduct = await api.createProduct(productData)
        } else {
          // Check if product already exists in target shop by SKU
          let existingProducts: any[] = []
          if (product.sku) {
            const result = await api.getProducts({ sku: product.sku })
            existingProducts = result.products
          }

          if (existingProducts.length > 0) {
            // Update existing product
            wooProduct = await api.updateProduct(existingProducts[0].id, productData)
          } else {
            // Create new product
            wooProduct = await api.createProduct(productData)
          }
        }

        // Save to local database
        await db.insert(products).values({
          shopId: targetShopId,
          wooId: wooProduct.id,
          name: wooProduct.name,
          slug: wooProduct.slug,
          type: wooProduct.type,
          status: wooProduct.status,
          sku: wooProduct.sku,
          price: wooProduct.price || null,
          regularPrice: wooProduct.regular_price || null,
          salePrice: wooProduct.sale_price || null,
          stockStatus: wooProduct.stock_status,
          stockQuantity: wooProduct.stock_quantity || null,
          description: wooProduct.description,
          shortDescription: wooProduct.short_description,
          categories: wooProduct.categories,
          images: wooProduct.images,
          attributes: wooProduct.attributes,
          variations: [],
          dateCreated: new Date(wooProduct.date_created),
          dateModified: new Date(wooProduct.date_modified),
        }).returning()

        results.push({
          success: true,
          productId: product.id,
          wooId: wooProduct.id,
          name: wooProduct.name
        })

      } catch (error) {
        console.error(`Failed to transfer product ${product.name}:`, error)
        errors.push({
          productId: product.id,
          name: product.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // If updating products from same shop, mark them as synced
    if (sourceShopId && sourceShopId !== targetShopId) {
      for (const result of results) {
        if (result.success) {
          try {
            await db.update(products)
              .set({ 
                dateModified: new Date(),
                updatedAt: new Date()
              })
              .where(eq(products.id, result.productId))
          } catch (error) {
            console.error('Failed to update source product:', error)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      transferred: results.length,
      failed: errors.length,
      results,
      errors
    })

  } catch (error) {
    console.error('Product transfer error:', error)
    return NextResponse.json(
      { error: 'Failed to transfer products' },
      { status: 500 }
    )
  }
}
