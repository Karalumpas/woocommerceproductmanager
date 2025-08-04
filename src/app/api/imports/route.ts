import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { importBatches, importErrors } from '../../../lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
// Remove BullMQ import for now to fix build
// import { csvImportQueue } from '../../../workers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 })
    }

    const batches = await db
      .select()
      .from(importBatches)
      .where(eq(importBatches.shopId, parseInt(shopId)))
      .orderBy(desc(importBatches.createdAt))
      .limit(50)

    return NextResponse.json({ batches })
  } catch (error) {
    console.error('Error fetching import batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch import batches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const shopId = formData.get('shopId') as string

    if (!file || !type || !shopId) {
      return NextResponse.json(
        { error: 'File, type, and shop ID are required' },
        { status: 400 }
      )
    }

    if (!['parent', 'variations'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "parent" or "variations"' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Save file with unique name
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Create import batch record
    const [batch] = await db
      .insert(importBatches)
      .values({
        shopId: parseInt(shopId),
        filename: file.name,
        fileSize: file.size,
        type: type as 'parent' | 'variations',
        status: 'pending',
      })
      .returning()

    // Add job to queue
    // TODO: Re-enable when BullMQ Redis config is fixed
    // await csvImportQueue.add(
    //   `csv-import-${batch.id}`,
    //   {
    //     batchId: batch.id,
    //     shopId: parseInt(shopId),
    //     filePath,
    //     type,
    //   },
    //   {
    //     attempts: 3,
    //     backoff: {
    //       type: 'exponential',
    //       delay: 2000,
    //     },
    //   }
    // )

    return NextResponse.json({ batch })
  } catch (error) {
    console.error('Error creating import batch:', error)
    return NextResponse.json(
      { error: 'Failed to create import batch' },
      { status: 500 }
    )
  }
}
