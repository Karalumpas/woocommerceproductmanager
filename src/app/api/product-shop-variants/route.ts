import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { productShopVariants } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { productShopId, variationIds } = await request.json()

    if (!productShopId || !Array.isArray(variationIds)) {
      return NextResponse.json(
        { error: 'productShopId and variationIds are required' },
        { status: 400 }
      )
    }

    await db
      .delete(productShopVariants)
      .where(eq(productShopVariants.productShopId, productShopId))

    if (variationIds.length > 0) {
      await db.insert(productShopVariants).values(
        variationIds.map((id: number) => ({ productShopId, variationId: id }))
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save selected variants:', error)
    return NextResponse.json(
      { error: 'Failed to save selected variants' },
      { status: 500 }
    )
  }
}
