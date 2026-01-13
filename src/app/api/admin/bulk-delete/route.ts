import { NextRequest, NextResponse } from 'next/server'
import { db, players, categories } from '@/db'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// DELETE to bulk delete all data from a game type
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get('type')

    if (!gameType || !['squaddle', 'outliers'].includes(gameType)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "squaddle" or "outliers"' },
        { status: 400 }
      )
    }

    let deletedCount = 0

    if (gameType === 'squaddle') {
      const result = await db.delete(players)
      deletedCount = result.rowCount ?? 0
    } else if (gameType === 'outliers') {
      const result = await db.delete(categories)
      deletedCount = result.rowCount ?? 0
    }

    return NextResponse.json({
      success: true,
      message: `Deleted all ${gameType} data`,
      deletedCount,
    })
  } catch (error) {
    console.error('Failed to bulk delete:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}
