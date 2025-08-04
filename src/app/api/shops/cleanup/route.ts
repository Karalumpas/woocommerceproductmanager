import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { shops } from '../../../../lib/db/schema'

export async function DELETE() {
  try {
    // Slet alle shops fra databasen
    await db.delete(shops)
    
    return NextResponse.json({ 
      message: 'All shops deleted successfully' 
    })
  } catch (error) {
    console.error('Failed to delete shops:', error)
    return NextResponse.json(
      { error: 'Failed to delete shops' },
      { status: 500 }
    )
  }
}
