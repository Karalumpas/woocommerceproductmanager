import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { products, variations, shops } from '../../../lib/db/schema'
import { eq, ilike, or, and, desc, asc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    
    // Filter parameters
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const status = searchParams.get('status')
    const stockStatus = searchParams.get('stockStatus')
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'dateModified'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

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

    // Add category filter
    if (category) {
      whereConditions.push(
        sql`CAST(${products.categories} AS TEXT) LIKE ${'%"name":"' + category + '"%'}`
      )
    }

    // Add brand filter (assuming brand is stored in attributes)
    if (brand) {
      whereConditions.push(
        sql`CAST(${products.attributes} AS TEXT) LIKE ${'%"name":"brand"%"option":"' + brand + '"%'}`
      )
    }

    // Add status filter
    if (status) {
      whereConditions.push(eq(products.status, status))
    }

    // Add stock status filter
    if (stockStatus) {
      whereConditions.push(eq(products.stockStatus, stockStatus))
    }

    // Add type filter
    if (type) {
      whereConditions.push(eq(products.type, type))
    }

    // Determine sort column and order
    let sortColumn
    switch (sortBy) {
      case 'name':
        sortColumn = products.name
        break
      case 'price':
        sortColumn = products.regularPrice
        break
      case 'dateCreated':
        sortColumn = products.dateCreated
        break
      case 'sku':
        sortColumn = products.sku
        break
      default:
        sortColumn = products.dateModified
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...whereConditions))

    const totalCount = totalCountResult[0]?.count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // Add pagination
    const offset = (page - 1) * limit
    const productsResult = await db
      .select()
      .from(products)
      .where(and(...whereConditions))
      .orderBy(sortFunction(sortColumn))
      .limit(limit + 1) // Get one extra to check if there are more
      .offset(offset)

    const hasMore = productsResult.length > limit
    const productsToReturn = hasMore ? productsResult.slice(0, -1) : productsResult

    // Parse JSONB fields and fetch variations count
    const parsedProducts = await Promise.all(productsToReturn.map(async (product) => {
      // Get variations count for variable products
      let variationsCount = 0
      if (product.type === 'variable') {
        try {
          const variationsResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(variations)
            .where(eq(variations.productId, product.id))
          
          variationsCount = Number(variationsResult[0]?.count) || 0
        } catch (error) {
          console.error('Error fetching variations count:', error)
        }
      }

      // Safe JSON parsing with fallbacks
      const parseJsonSafely = (jsonString: any, fallback: any = []) => {
        if (!jsonString) return fallback
        if (typeof jsonString !== 'string') return jsonString
        try {
          return JSON.parse(jsonString)
        } catch (error) {
          console.error('JSON parse error:', error)
          return fallback
        }
      }

      return {
        ...product,
        images: parseJsonSafely(product.images, []),
        categories: parseJsonSafely(product.categories, []),
        attributes: parseJsonSafely(product.attributes, []),
        variations: Array.from({ length: variationsCount }, (_, i) => ({ id: i + 1 })), // Mock variations for count display
        variationsCount
      }
    }))

    return NextResponse.json({
      products: parsedProducts,
      hasMore,
      page,
      limit,
      total: totalCount,
      totalPages,
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
