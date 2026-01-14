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
    // Accept client's local date for timezone consistency
    const clientDate = searchParams.get('clientDate')

    const allPlayers = await db.select().from(players)
    const allCategories = await db.select().from(categories)

    const schedule = []
    // Use client date if provided, otherwise use server date
    const today = clientDate ? new Date(clientDate + 'T00:00:00') : new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = formatDate(date)
      const dayNumber = getDayNumberForDate(dateStr)
      const seed = dateToSeed(dateStr)
      const random = seededRandom(seed)

      // Get Squaddle players for this day (prioritize scheduled, then random)
      const scheduledEasyPlayer = allPlayers.find(
        (p) => p.difficulty === 'easy' && p.scheduledDate === dateStr
      )
      const scheduledMediumPlayer = allPlayers.find(
        (p) => p.difficulty === 'medium' && p.scheduledDate === dateStr
      )
      const scheduledHardPlayer = allPlayers.find(
        (p) => p.difficulty === 'hard' && p.scheduledDate === dateStr
      )

      // Fallback to random selection for unscheduled slots
      const unscheduledEasy = allPlayers.filter((p) => p.difficulty === 'easy' && !p.scheduledDate)
      const unscheduledMedium = allPlayers.filter(
        (p) => p.difficulty === 'medium' && !p.scheduledDate
      )
      const unscheduledHard = allPlayers.filter((p) => p.difficulty === 'hard' && !p.scheduledDate)

      const shuffledEasy = shuffleWithSeed(unscheduledEasy, random)
      const shuffledMedium = shuffleWithSeed(unscheduledMedium, random)
      const shuffledHard = shuffleWithSeed(unscheduledHard, random)

      const squaddlePlayers = [
        scheduledEasyPlayer || shuffledEasy[0] || null,
        scheduledMediumPlayer || shuffledMedium[0] || null,
        scheduledHardPlayer || shuffledHard[0] || null,
      ]

      // Get Outliers categories for this day (prioritize scheduled, then random)
      // Use same seeding algorithm as Outliers API: seed + difficulty * 1000
      const easyOutliersRandom = seededRandom(seed + 1 * 1000)
      const mediumOutliersRandom = seededRandom(seed + 2 * 1000)
      const hardOutliersRandom = seededRandom(seed + 3 * 1000)

      const scheduledEasyCategory = allCategories.find(
        (c) => c.difficulty === 1 && c.scheduledDate === dateStr
      )
      const scheduledMediumCategory = allCategories.find(
        (c) => c.difficulty === 2 && c.scheduledDate === dateStr
      )
      const scheduledHardCategory = allCategories.find(
        (c) => c.difficulty === 3 && c.scheduledDate === dateStr
      )

      // Fallback to random selection for unscheduled slots
      const unscheduledEasyCategories = allCategories.filter(
        (c) => c.difficulty === 1 && !c.scheduledDate
      )
      const unscheduledMediumCategories = allCategories.filter(
        (c) => c.difficulty === 2 && !c.scheduledDate
      )
      const unscheduledHardCategories = allCategories.filter(
        (c) => c.difficulty === 3 && !c.scheduledDate
      )

      const shuffledEasyCategories = shuffleWithSeed(unscheduledEasyCategories, easyOutliersRandom)
      const shuffledMediumCategories = shuffleWithSeed(
        unscheduledMediumCategories,
        mediumOutliersRandom
      )
      const shuffledHardCategories = shuffleWithSeed(unscheduledHardCategories, hardOutliersRandom)

      const outliersCategories = [
        scheduledEasyCategory || shuffledEasyCategories[0] || null,
        scheduledMediumCategory || shuffledMediumCategories[0] || null,
        scheduledHardCategory || shuffledHardCategories[0] || null,
      ]

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
        outliers: {
          easy: outliersCategories[0]
            ? {
                id: outliersCategories[0].id,
                connection: outliersCategories[0].connection,
              }
            : null,
          medium: outliersCategories[1]
            ? {
                id: outliersCategories[1].id,
                connection: outliersCategories[1].connection,
              }
            : null,
          hard: outliersCategories[2]
            ? {
                id: outliersCategories[2].id,
                connection: outliersCategories[2].connection,
              }
            : null,
        },
      })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Failed to fetch schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}
