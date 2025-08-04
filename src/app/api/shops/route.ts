import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSessionFromCookie } from '../../../lib/auth'

export async function GET() {
  try {
    // Get user session
    const sessionData = await getSessionFromCookie()
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only return shops for the current user
    const userShops = await db
      .select()
      .from(shops)
      .where(eq(shops.userId, sessionData.user.id))
      .orderBy(shops.createdAt)
    
    return NextResponse.json(userShops)
  } catch (error) {
    console.error('Failed to fetch shops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const sessionData = await getSessionFromCookie()
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const [newShop] = await db
      .insert(shops)
      .values({
        userId: sessionData.user.id,
        name,
        baseUrl: cleanBaseUrl,
        consumerKey,
        consumerSecret,
        isActive: true,
        status: 'unknown',
      })
      .returning()

    return NextResponse.json(newShop, { status: 201 })
  } catch (error) {
    console.error('Failed to create shop:', error)
    return NextResponse.json(
      { error: 'Failed to create shop' },
      { status: 500 }
    )
  }
}
