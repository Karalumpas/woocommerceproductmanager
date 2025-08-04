import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { importBatches, importErrors } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = parseInt(params.id)

    const [batch] = await db
      .select()
      .from(importBatches)
      .where(eq(importBatches.id, batchId))
      .limit(1)

    if (!batch) {
      return NextResponse.json({ error: 'Import batch not found' }, { status: 404 })
    }

    const errors = await db
      .select()
      .from(importErrors)
      .where(eq(importErrors.batchId, batchId))
      .limit(100) // Limit errors to prevent huge responses

    return NextResponse.json({ batch, errors })
  } catch (error) {
    console.error('Error fetching import batch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch import batch' },
      { status: 500 }
    )
  }
}
