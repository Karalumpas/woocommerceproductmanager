import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { products, shops } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { WooCommerceClient } from '../../../../lib/woocommerce'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    const updateData = await request.json()

    // Get the current product to find its shop
    const currentProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (currentProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = currentProduct[0]

    // If product has a wooId and shopId, update in WooCommerce
    if (product.wooId && product.shopId) {
      const shop = await db
        .select()
        .from(shops)
        .where(eq(shops.id, product.shopId))
        .limit(1)

      if (shop.length > 0) {
        try {
          const wooClient = new WooCommerceClient(shop[0])
          
          // Prepare data for WooCommerce
          const wooData = {
            name: updateData.name,
            description: updateData.description,
            short_description: updateData.shortDescription,
            sku: updateData.sku,
            regular_price: updateData.regularPrice,
            sale_price: updateData.salePrice,
            stock_quantity: updateData.stockQuantity,
            stock_status: updateData.stockStatus,
            status: updateData.status,
            type: updateData.type,
            categories: updateData.categories?.map((cat: any) => ({ id: cat.id })) || [],
            images: updateData.images?.map((img: any) => ({ src: img.src, alt: img.alt })) || [],
            attributes: updateData.attributes || [],
          }

          // Update in WooCommerce
          const updatedWooProduct = await wooClient.updateProduct(product.wooId, wooData)
          
          // Update local database with WooCommerce response
          await db
            .update(products)
            .set({
              name: updatedWooProduct.name,
              description: updatedWooProduct.description,
              shortDescription: updatedWooProduct.short_description,
              sku: updatedWooProduct.sku,
              regularPrice: updatedWooProduct.regular_price,
              salePrice: updatedWooProduct.sale_price,
              stockQuantity: updatedWooProduct.stock_quantity,
              stockStatus: updatedWooProduct.stock_status,
              status: updatedWooProduct.status,
              type: updatedWooProduct.type,
              categories: updatedWooProduct.categories,
              images: updatedWooProduct.images,
              attributes: updatedWooProduct.attributes,
              dateModified: new Date(updatedWooProduct.date_modified),
              updatedAt: new Date(),
            })
            .where(eq(products.id, productId))

          return NextResponse.json({ 
            success: true, 
            message: 'Product updated in WooCommerce and local database' 
          })
        } catch (wooError) {
          console.error('WooCommerce update failed:', wooError)
          // Fall back to local update only
        }
      }
    }

    // Update only in local database (for CSV products or when WooCommerce update fails)
    await db
      .update(products)
      .set({
        name: updateData.name,
        description: updateData.description,
        shortDescription: updateData.shortDescription,
        sku: updateData.sku,
        regularPrice: updateData.regularPrice,
        salePrice: updateData.salePrice,
        stockQuantity: updateData.stockQuantity,
        stockStatus: updateData.stockStatus,
        status: updateData.status,
        type: updateData.type,
        categories: updateData.categories || [],
        images: updateData.images || [],
        attributes: updateData.attributes || [],
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))

    return NextResponse.json({ 
      success: true, 
      message: 'Product updated in local database' 
    })

  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    // Get the current product to find its shop
    const currentProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (currentProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = currentProduct[0]

    // If product has a wooId and shopId, delete from WooCommerce
    if (product.wooId && product.shopId) {
      const shop = await db
        .select()
        .from(shops)
        .where(eq(shops.id, product.shopId))
        .limit(1)

      if (shop.length > 0) {
        try {
          const wooClient = new WooCommerceClient(shop[0])
          await wooClient.deleteProduct(product.wooId, true) // force delete
        } catch (wooError) {
          console.error('WooCommerce delete failed:', wooError)
          // Continue with local delete even if WooCommerce delete fails
        }
      }
    }

    // Delete from local database
    await db.delete(products).where(eq(products.id, productId))

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    })

  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
