import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookie, deleteSession, clearSessionCookie } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const sessionData = await getSessionFromCookie()
    
    if (sessionData) {
      await deleteSession(sessionData.session.id)
    }
    
    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
