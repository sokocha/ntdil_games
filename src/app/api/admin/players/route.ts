import { NextRequest, NextResponse } from 'next/server'
import { db, players } from '@/db'
import { eq } from 'drizzle-orm'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// GET all players
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const allPlayers = await db.select().from(players).orderBy(players.difficulty, players.name)
    return NextResponse.json(allPlayers)
  } catch (error) {
    console.error('Failed to fetch players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

// POST create new player
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { playerId, name, acceptedAnswers, clues, difficulty } = body

    if (!playerId || !name || !acceptedAnswers || !clues || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newPlayer = await db
      .insert(players)
      .values({
        playerId,
        name,
        acceptedAnswers,
        clues,
        difficulty,
      })
      .returning()

    return NextResponse.json(newPlayer[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create player:', error)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}

// PUT update player
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { id, playerId, name, acceptedAnswers, clues, difficulty } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing player id' }, { status: 400 })
    }

    const updatedPlayer = await db
      .update(players)
      .set({
        playerId,
        name,
        acceptedAnswers,
        clues,
        difficulty,
        updatedAt: new Date(),
      })
      .where(eq(players.id, id))
      .returning()

    if (updatedPlayer.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(updatedPlayer[0])
  } catch (error) {
    console.error('Failed to update player:', error)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}

// DELETE player
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing player id' }, { status: 400 })
    }

    const deleted = await db
      .delete(players)
      .where(eq(players.id, parseInt(id)))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete player:', error)
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}
