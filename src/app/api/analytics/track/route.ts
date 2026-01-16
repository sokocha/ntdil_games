import { NextRequest, NextResponse } from 'next/server'
import { db, gamePlays } from '@/db'
import { and, eq } from 'drizzle-orm'

// Get today's date string in YYYY-MM-DD format (server time)
function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get client IP address from request
function getClientIP(request: NextRequest): string | null {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Vercel-specific header
  const vercelIP = request.headers.get('x-vercel-forwarded-for')
  if (vercelIP) {
    return vercelIP.split(',')[0].trim()
  }

  return null
}

// POST - track a game play
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, game } = body

    if (!playerId || !game) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['squaddle', 'outliers', 'simon'].includes(game)) {
      return NextResponse.json({ error: 'Invalid game' }, { status: 400 })
    }

    const today = getTodayString()
    const ipAddress = getClientIP(request)

    // Check if this player already played this game today (prevent duplicate tracking)
    const existing = await db
      .select()
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.uniquePlayerId, playerId),
          eq(gamePlays.game, game),
          eq(gamePlays.playDate, today)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Already tracked today
      return NextResponse.json({ success: true, duplicate: true })
    }

    // Insert new play record
    await db.insert(gamePlays).values({
      uniquePlayerId: playerId,
      ipAddress,
      game,
      playDate: today,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
