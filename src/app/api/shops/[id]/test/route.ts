import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { WooCommerceClient } from '@/lib/woocommerce'

interface Params {
  id: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shop ID' },
        { status: 400 }
      )
    }

    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, id))
      .limit(1)

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    // Test connection using WooCommerce client
    const client = new WooCommerceClient(shop)
    const isOnline = await client.testConnection()

    // Update shop status and last ping
    const [updatedShop] = await db
      .update(shops)
      .set({
        status: isOnline ? 'online' : 'offline',
        lastPing: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shops.id, id))
      .returning()

    return NextResponse.json({
      success: isOnline,
      shop: updatedShop,
      message: isOnline ? 'Connection successful' : 'Connection failed',
    })
  } catch (error) {
    console.error('Failed to test connection:', error)
    
    // Update shop status to offline on error
    try {
      await db
        .update(shops)
        .set({
          status: 'offline',
          lastPing: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(shops.id, parseInt(params.id)))
    } catch (updateError) {
      console.error('Failed to update shop status:', updateError)
    }

    return NextResponse.json({
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
