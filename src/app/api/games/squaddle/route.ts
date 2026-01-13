import { NextRequest, NextResponse } from 'next/server'
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

function dateToSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, part) => acc * 100 + parseInt(part), 0)
}

// GET daily players for Squaddle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Accept date from client (uses client's local timezone)
    const dateStr = searchParams.get('date')

    // Validate date format or use server date as fallback
    let targetDate: string
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      targetDate = dateStr
    } else {
      // Fallback to server date (not ideal, but safe)
      const now = new Date()
      targetDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }

    const allPlayers = await db.select().from(players)

    if (allPlayers.length === 0) {
      return NextResponse.json({ error: 'No players in database' }, { status: 404 })
    }

    const seed = dateToSeed(targetDate)
    const random = seededRandom(seed)

    // Check for scheduled players first (prioritize scheduled over random)
    const scheduledEasy = allPlayers.find(
      (p) => p.difficulty === 'easy' && p.scheduledDate === targetDate
    )
    const scheduledMedium = allPlayers.find(
      (p) => p.difficulty === 'medium' && p.scheduledDate === targetDate
    )
    const scheduledHard = allPlayers.find(
      (p) => p.difficulty === 'hard' && p.scheduledDate === targetDate
    )

    // Filter unscheduled players by difficulty for random fallback
    const unscheduledEasy = allPlayers.filter((p) => p.difficulty === 'easy' && !p.scheduledDate)
    const unscheduledMedium = allPlayers.filter(
      (p) => p.difficulty === 'medium' && !p.scheduledDate
    )
    const unscheduledHard = allPlayers.filter((p) => p.difficulty === 'hard' && !p.scheduledDate)

    // Shuffle unscheduled players
    const shuffledEasy = shuffleWithSeed(unscheduledEasy, random)
    const shuffledMedium = shuffleWithSeed(unscheduledMedium, random)
    const shuffledHard = shuffleWithSeed(unscheduledHard, random)

    // Use scheduled if available, otherwise use random from unscheduled
    const dailyPlayers = [
      scheduledEasy || shuffledEasy[0],
      scheduledMedium || shuffledMedium[0],
      scheduledHard || shuffledHard[0],
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
