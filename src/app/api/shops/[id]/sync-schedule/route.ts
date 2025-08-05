import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shops, syncSchedules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSessionFromCookie } from '@/lib/auth'
import Redis from 'ioredis'
import { Queue } from 'bullmq'

interface Params {
  id: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const sessionData = await getSessionFromCookie()
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const interval = body.interval

    if (isNaN(id) || !interval) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const [shop] = await db
      .select()
      .from(shops)
      .where(and(eq(shops.id, id), eq(shops.userId, sessionData.user.id)))
      .limit(1)

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const [schedule] = await db
      .insert(syncSchedules)
      .values({ productShopId: id, interval, lastRun: new Date() })
      .onConflictDoUpdate({
        target: syncSchedules.productShopId,
        set: { interval, updatedAt: new Date() },
      })
      .returning()

    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    })
    const queue = new Queue('shop-sync', { connection: redis })
    await queue.add(`shop-sync-${id}`, { shopId: id }, {
      repeat: { every: interval * 1000 },
    })
    await queue.close()
    await redis.quit()

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Failed to start sync schedule:', error)
    return NextResponse.json(
      { error: 'Failed to start schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const sessionData = await getSessionFromCookie()
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shop ID' }, { status: 400 })
    }

    const [schedule] = await db
      .select()
      .from(syncSchedules)
      .where(eq(syncSchedules.productShopId, id))
      .limit(1)

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    })
    const queue = new Queue('shop-sync', { connection: redis })
    await queue.removeRepeatable(`shop-sync-${id}`, {
      every: schedule.interval * 1000,
    })
    await queue.close()
    await redis.quit()

    await db.delete(syncSchedules).where(eq(syncSchedules.id, schedule.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to stop sync schedule:', error)
    return NextResponse.json(
      { error: 'Failed to stop schedule' },
      { status: 500 }
    )
  }
}
