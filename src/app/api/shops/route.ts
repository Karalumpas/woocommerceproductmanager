import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allShops = await db.select().from(shops).orderBy(shops.createdAt)
    return NextResponse.json(allShops)
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
