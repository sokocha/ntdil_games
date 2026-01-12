import { NextResponse } from 'next/server'
import { db, players } from '@/db'

// Seeded random for consistent daily selection
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// GET daily players for Squaddle
export async function GET() {
  try {
    const allPlayers = await db.select().from(players)

    if (allPlayers.length === 0) {
      return NextResponse.json({ error: 'No players in database' }, { status: 404 })
    }

    // Get today's date for seeding
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const seed = dateStr.split('-').reduce((acc, part) => acc * 100 + parseInt(part), 0)
    const random = seededRandom(seed)

    // Filter by difficulty
    const easy = allPlayers.filter((p) => p.difficulty === 'easy')
    const medium = allPlayers.filter((p) => p.difficulty === 'medium')
    const hard = allPlayers.filter((p) => p.difficulty === 'hard')

    // Shuffle and pick one from each
    const shuffledEasy = shuffleWithSeed(easy, random)
    const shuffledMedium = shuffleWithSeed(medium, random)
    const shuffledHard = shuffleWithSeed(hard, random)

    const dailyPlayers = [
      shuffledEasy[0] || easy[0],
      shuffledMedium[0] || medium[0],
      shuffledHard[0] || hard[0],
    ].filter(Boolean)

    // Transform to match expected format
    const formattedPlayers = dailyPlayers.map((p) => ({
      id: p.playerId,
      name: p.name,
      acceptedAnswers: p.acceptedAnswers,
      clues: p.clues,
      difficulty: p.difficulty,
    }))

    return NextResponse.json(formattedPlayers)
  } catch (error) {
    console.error('Failed to fetch daily players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}
