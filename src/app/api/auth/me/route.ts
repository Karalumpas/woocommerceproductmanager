import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookie } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionData = await getSessionFromCookie()

    if (!sessionData) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        username: sessionData.user.username,
        autoSync: sessionData.user.autoSync,
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
