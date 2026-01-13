import { NextRequest, NextResponse } from 'next/server'
import { db, players, categories } from '@/db'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

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

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Squaddle launch date
const SQUADDLE_START_DATE = '2026-01-09'

function getDayNumberForDate(dateStr: string): number {
  const start = new Date(SQUADDLE_START_DATE).setHours(0, 0, 0, 0)
  const target = new Date(dateStr).setHours(0, 0, 0, 0)
  return Math.floor((target - start) / (1000 * 60 * 60 * 24)) + 1
}

// GET schedule for upcoming days
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days') || '14'
    const days = Math.min(parseInt(daysParam), 30) // Max 30 days

    const allPlayers = await db.select().from(players)
    const allCategories = await db.select().from(categories)

    const schedule = []
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = formatDate(date)
      const dayNumber = getDayNumberForDate(dateStr)
      const seed = dateToSeed(dateStr)
      const random = seededRandom(seed)

      // Get Squaddle players for this day
      const easy = allPlayers.filter((p) => p.difficulty === 'easy')
      const medium = allPlayers.filter((p) => p.difficulty === 'medium')
      const hard = allPlayers.filter((p) => p.difficulty === 'hard')

      const shuffledEasy = shuffleWithSeed(easy, random)
      const shuffledMedium = shuffleWithSeed(medium, random)
      const shuffledHard = shuffleWithSeed(hard, random)

      const squaddlePlayers = [
        shuffledEasy[0] || null,
        shuffledMedium[0] || null,
        shuffledHard[0] || null,
      ]

      // Get Outliers category for this day (reset random for fair distribution)
      const outliersRandom = seededRandom(seed + 1000)
      const shuffledCategories = shuffleWithSeed(allCategories, outliersRandom)
      const outliersCategory = shuffledCategories[0] || null

      schedule.push({
        date: dateStr,
        dayNumber,
        isToday: i === 0,
        squaddle: {
          easy: squaddlePlayers[0]
            ? {
                id: squaddlePlayers[0].id,
                playerId: squaddlePlayers[0].playerId,
                name: squaddlePlayers[0].name,
              }
            : null,
          medium: squaddlePlayers[1]
            ? {
                id: squaddlePlayers[1].id,
                playerId: squaddlePlayers[1].playerId,
                name: squaddlePlayers[1].name,
              }
            : null,
          hard: squaddlePlayers[2]
            ? {
                id: squaddlePlayers[2].id,
                playerId: squaddlePlayers[2].playerId,
                name: squaddlePlayers[2].name,
              }
            : null,
        },
        outliers: outliersCategory
          ? {
              id: outliersCategory.id,
              connection: outliersCategory.connection,
              difficulty: outliersCategory.difficulty,
            }
          : null,
      })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Failed to fetch schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}
