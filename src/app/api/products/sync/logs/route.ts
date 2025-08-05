import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { productSyncLogs } from '../../../../../lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  try {
    const logs = await db
      .select()
      .from(productSyncLogs)
      .where(eq(productSyncLogs.productShopId, parseInt(productId)))
      .orderBy(desc(productSyncLogs.createdAt))

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Failed to fetch sync logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
