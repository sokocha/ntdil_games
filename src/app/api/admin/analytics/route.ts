import { NextRequest, NextResponse } from 'next/server'
import { db, gamePlays } from '@/db'
import { sql, desc } from 'drizzle-orm'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// GET analytics data
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    // Get unique players per game (all time)
    const uniquePlayersPerGame = await db
      .select({
        game: gamePlays.game,
        uniquePlayers: sql<number>`COUNT(DISTINCT ${gamePlays.uniquePlayerId})`,
        totalPlays: sql<number>`COUNT(*)`,
      })
      .from(gamePlays)
      .groupBy(gamePlays.game)

    // Get unique players per game per day (last 30 days)
    const dailyStats = await db
      .select({
        playDate: gamePlays.playDate,
        game: gamePlays.game,
        uniquePlayers: sql<number>`COUNT(DISTINCT ${gamePlays.uniquePlayerId})`,
      })
      .from(gamePlays)
      .groupBy(gamePlays.playDate, gamePlays.game)
      .orderBy(desc(gamePlays.playDate))
      .limit(90) // 30 days * 3 games

    // Get total unique players across all games
    const totalUniquePlayers = await db
      .select({
        uniquePlayers: sql<number>`COUNT(DISTINCT ${gamePlays.uniquePlayerId})`,
      })
      .from(gamePlays)

    // Get total unique players per day (across all games)
    const dailyTotals = await db
      .select({
        playDate: gamePlays.playDate,
        uniquePlayers: sql<number>`COUNT(DISTINCT ${gamePlays.uniquePlayerId})`,
        totalPlays: sql<number>`COUNT(*)`,
      })
      .from(gamePlays)
      .groupBy(gamePlays.playDate)
      .orderBy(desc(gamePlays.playDate))
      .limit(30)

    // Get unique IPs for cross-reference (privacy-safe - just count)
    const uniqueIPs = await db
      .select({
        uniqueIPs: sql<number>`COUNT(DISTINCT ${gamePlays.ipAddress})`,
      })
      .from(gamePlays)

    return NextResponse.json({
      summary: {
        totalUniquePlayers: totalUniquePlayers[0]?.uniquePlayers || 0,
        uniqueIPAddresses: uniqueIPs[0]?.uniqueIPs || 0,
      },
      byGame: uniquePlayersPerGame.map((row) => ({
        game: row.game,
        uniquePlayers: Number(row.uniquePlayers),
        totalPlays: Number(row.totalPlays),
      })),
      dailyStats: dailyStats.map((row) => ({
        date: row.playDate,
        game: row.game,
        uniquePlayers: Number(row.uniquePlayers),
      })),
      dailyTotals: dailyTotals.map((row) => ({
        date: row.playDate,
        uniquePlayers: Number(row.uniquePlayers),
        totalPlays: Number(row.totalPlays),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
