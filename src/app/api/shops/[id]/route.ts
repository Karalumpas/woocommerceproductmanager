import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { WooCommerceClient } from '@/lib/woocommerce'

interface Params {
  id: string
}

export async function GET(
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

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Failed to fetch shop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shop' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const { name, baseUrl, consumerKey, consumerSecret } = body

    // Basic validation
    if (!name || !baseUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure baseUrl doesn't end with slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')

    const [updatedShop] = await db
      .update(shops)
      .set({
        name,
        baseUrl: cleanBaseUrl,
        consumerKey,
        consumerSecret,
        updatedAt: new Date(),
      })
      .where(eq(shops.id, id))
      .returning()

    if (!updatedShop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Failed to update shop:', error)
    return NextResponse.json(
      { error: 'Failed to update shop' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const [deletedShop] = await db
      .delete(shops)
      .where(eq(shops.id, id))
      .returning()

    if (!deletedShop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete shop:', error)
    return NextResponse.json(
      { error: 'Failed to delete shop' },
      { status: 500 }
    )
  }
}
