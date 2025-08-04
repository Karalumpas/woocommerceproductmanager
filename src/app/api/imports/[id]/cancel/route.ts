import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { importBatches } from '../../../../../lib/db/schema'
import { eq } from 'drizzle-orm'
// Remove BullMQ import for now to fix build
// import { csvImportQueue } from '../../../../../workers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = parseInt(params.id)

    // Check if batch exists and is cancellable
    const [batch] = await db
      .select()
      .from(importBatches)
      .where(eq(importBatches.id, batchId))
      .limit(1)

    if (!batch) {
      return NextResponse.json({ error: 'Import batch not found' }, { status: 404 })
    }

    if (!['pending', 'processing'].includes(batch.status!)) {
      return NextResponse.json(
        { error: 'Import batch cannot be cancelled' },
        { status: 400 }
      )
    }

    // Try to remove job from queue
    // TODO: Re-enable when BullMQ Redis config is fixed
    // const jobs = await csvImportQueue.getJobs(['active', 'waiting', 'delayed'])
    // const job = jobs.find(j => j.data.batchId === batchId)
    
    // if (job) {
    //   await job.remove()
    // }

    // Update batch status
    await db
      .update(importBatches)
      .set({
        status: 'failed',
        completedAt: new Date(),
        errors: [{ message: 'Import cancelled by user' }],
        updatedAt: new Date(),
      })
      .where(eq(importBatches.id, batchId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling import batch:', error)
    return NextResponse.json(
      { error: 'Failed to cancel import batch' },
      { status: 500 }
    )
  }
}
