import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { users } from '../../../../lib/db/schema'
import { getCurrentUser } from '../../../../lib/auth'
import { eq } from 'drizzle-orm'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, username, autoSync } = await request.json()

    if (!email || !username) {
      return NextResponse.json({ error: 'Email and username are required' }, { status: 400 })
    }

    // Check if email or username already exists (excluding current user)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0 && existingUser[0].id !== user.id) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (existingUsername.length > 0 && existingUsername[0].id !== user.id) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // Update user
    await db
      .update(users)
      .set({
        email,
        username,
        autoSync: autoSync || false,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
