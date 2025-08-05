import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { masterProducts, productShops } from '../../../lib/db/schema'
import { eq, ilike, or, and, desc, asc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    const whereConditions = [eq(productShops.shopId, parseInt(shopId))]

    if (search) {
      whereConditions.push(
        or(
          ilike(masterProducts.name, `%${search}%`),
          ilike(masterProducts.sku, `%${search}%`),
          ilike(masterProducts.description, `%${search}%`)
        )!
      )
    }

    if (category) {
      whereConditions.push(eq(productShops.category, category))
    }

    let sortColumn
    switch (sortBy) {
      case 'price':
        sortColumn = productShops.price
        break
      case 'name':
      default:
        sortColumn = masterProducts.name
    }
    const sortFunction = sortOrder === 'desc' ? desc : asc

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(productShops)
      .innerJoin(
        masterProducts,
        eq(productShops.masterProductId, masterProducts.id)
      )
      .where(and(...whereConditions))

    const totalCount = Number(totalCountResult[0]?.count || 0)
    const totalPages = Math.ceil(totalCount / limit)
    const offset = (page - 1) * limit

    const rows = await db
      .select({
        shopData: productShops,
        master: masterProducts,
      })
      .from(productShops)
      .innerJoin(
        masterProducts,
        eq(productShops.masterProductId, masterProducts.id)
      )
      .where(and(...whereConditions))
      .orderBy(sortFunction(sortColumn))
      .limit(limit)
      .offset(offset)

    const productsResult = rows.map((row) => ({
      id: row.shopData.id,
      price: row.shopData.price,
      category: row.shopData.category,
      isActive: row.shopData.isActive,
      masterProductId: row.shopData.masterProductId,
      shopId: row.shopData.shopId,
      sku: row.master.sku,
      name: row.master.name,
      description: row.master.description,
    }))

    return NextResponse.json({
      products: productsResult,
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
    const { shopId, sku, name, description, price, category, isActive } = body

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    if (!sku || !name) {
      return NextResponse.json(
        { error: 'SKU and name are required' },
        { status: 400 }
      )
    }

    let [master] = await db
      .select()
      .from(masterProducts)
      .where(eq(masterProducts.sku, sku))
      .limit(1)

    if (!master) {
      ;[master] = await db
        .insert(masterProducts)
        .values({ sku, name, description })
        .returning()
    }

    const [shopProduct] = await db
      .insert(productShops)
      .values({
        masterProductId: master.id,
        shopId,
        price,
        category,
        isActive: isActive ?? true,
      })
      .onConflictDoUpdate({
        target: [productShops.masterProductId, productShops.shopId],
        set: {
          price,
          category,
          isActive: isActive ?? true,
          updatedAt: new Date(),
        },
      })
      .returning()

    return NextResponse.json({
      product: {
        id: shopProduct.id,
        masterProductId: master.id,
        shopId: shopProduct.shopId,
        price: shopProduct.price,
        category: shopProduct.category,
        isActive: shopProduct.isActive,
        sku: master.sku,
        name: master.name,
        description: master.description,
      },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
