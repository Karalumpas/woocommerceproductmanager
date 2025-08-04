import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, verifyPassword, updateUserPassword } from '../../../../lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    // Get user with password hash to verify current password
    const { db } = await import('../../../../lib/db')
    const { users } = await import('../../../../lib/db/schema')
    const { eq } = await import('drizzle-orm')

    const [userWithPassword] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!userWithPassword) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, userWithPassword.passwordHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Update password
    await updateUserPassword(user.id, newPassword)

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
