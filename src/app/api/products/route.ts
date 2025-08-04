import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { products, variations, shops } from '../../../lib/db/schema'
import { eq, ilike, or, and, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    let whereConditions = [eq(products.shopId, parseInt(shopId))]

    // Add search filter
    if (search) {
      whereConditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )!
      )
    }

    // Add pagination
    const offset = (page - 1) * limit
    const productsResult = await db
      .select()
      .from(products)
      .where(and(...whereConditions))
      .orderBy(desc(products.dateModified))
      .limit(limit + 1) // Get one extra to check if there are more
      .offset(offset)

    const hasMore = productsResult.length > limit
    const productsToReturn = hasMore ? productsResult.slice(0, -1) : productsResult

    // Parse JSONB fields that might be stored as strings
    const parsedProducts = productsToReturn.map(product => ({
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []),
      categories: typeof product.categories === 'string' ? JSON.parse(product.categories || '[]') : (product.categories || []),
      attributes: typeof product.attributes === 'string' ? JSON.parse(product.attributes || '[]') : (product.attributes || []),
      variations: typeof product.variations === 'string' ? JSON.parse(product.variations || '[]') : (product.variations || []),
    }))

    return NextResponse.json({
      products: parsedProducts,
      hasMore,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, ...productData } = body

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    // Validate required fields
    if (!productData.name || !productData.sku) {
      return NextResponse.json(
        { error: 'Name and SKU are required' },
        { status: 400 }
      )
    }

    // Check if product with same SKU already exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(
        eq(products.shopId, shopId),
        eq(products.sku, productData.sku)
      ))
      .limit(1)

    if (existingProduct.length > 0) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      )
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        shopId,
        wooId: 0, // Will be updated when synced with WooCommerce
        ...productData,
      })
      .returning()

    return NextResponse.json({ product: newProduct })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
