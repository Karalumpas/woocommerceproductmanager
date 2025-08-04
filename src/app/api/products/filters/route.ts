import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { products } from '../../../../lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    // Get unique categories
    const categoriesResult = await db
      .select({
        categories: products.categories
      })
      .from(products)
      .where(eq(products.shopId, parseInt(shopId)))

    const categoriesSet = new Set<string>()
    categoriesResult.forEach(row => {
      try {
        const categories = typeof row.categories === 'string' 
          ? JSON.parse(row.categories) 
          : row.categories || []
        
        if (Array.isArray(categories)) {
          categories.forEach((cat: any) => {
            if (cat && cat.name) {
              categoriesSet.add(cat.name)
            }
          })
        }
      } catch (e) {
        // Skip invalid JSON
      }
    })

    // Get unique brands from attributes
    const attributesResult = await db
      .select({
        attributes: products.attributes
      })
      .from(products)
      .where(eq(products.shopId, parseInt(shopId)))

    const brandsSet = new Set<string>()
    attributesResult.forEach(row => {
      try {
        const attributes = typeof row.attributes === 'string' 
          ? JSON.parse(row.attributes) 
          : row.attributes || []
        
        if (Array.isArray(attributes)) {
          attributes.forEach((attr: any) => {
            if (attr && attr.name && attr.name.toLowerCase() === 'brand' && attr.option) {
              brandsSet.add(attr.option)
            }
          })
        }
      } catch (e) {
        // Skip invalid JSON
      }
    })

    return NextResponse.json({
      categories: Array.from(categoriesSet).sort(),
      brands: Array.from(brandsSet).sort(),
    })
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}
