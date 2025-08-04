import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { shops } from '../../../../../lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSessionFromCookie } from '../../../../../lib/auth'

interface Params {
  id: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Get user session
    const sessionData = await getSessionFromCookie()
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shop ID' },
        { status: 400 }
      )
    }

    // Verify shop belongs to user
    const [shop] = await db
      .select()
      .from(shops)
      .where(and(eq(shops.id, id), eq(shops.userId, sessionData.user.id)))
      .limit(1)

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or unauthorized' },
        { status: 404 }
      )
    }

    // First, unset all existing default shops for this user
    await db
      .update(shops)
      .set({ isDefault: false })
      .where(eq(shops.userId, sessionData.user.id))

    // Then set this shop as default
    const [updatedShop] = await db
      .update(shops)
      .set({ 
        isDefault: true,
        updatedAt: new Date()
      })
      .where(eq(shops.id, id))
      .returning()

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Failed to set default shop:', error)
    return NextResponse.json(
      { error: 'Failed to set default shop' },
      { status: 500 }
    )
  }
}
