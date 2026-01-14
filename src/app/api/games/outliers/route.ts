import { NextRequest, NextResponse } from 'next/server'
import { db, categories } from '@/db'

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

// Get day number since launch for a given date
function getDayNumberForDate(dateStr: string): number {
  const start = new Date('2026-01-09').setHours(0, 0, 0, 0)
  const target = new Date(dateStr).setHours(0, 0, 0, 0)
  return Math.floor((target - start) / (1000 * 60 * 60 * 24)) + 1
}

// GET daily puzzle for Outliers
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

    const allCategories = await db.select().from(categories)

    if (allCategories.length === 0) {
      return NextResponse.json({ error: 'No categories in database' }, { status: 404 })
    }

    const dayNum = getDayNumberForDate(targetDate)
    const seed = dateToSeed(targetDate)

    // Generate rounds for each difficulty
    const difficultyMap = { 1: 'easy', 2: 'medium', 3: 'hard' } as const

    const rounds = [1, 2, 3].map((difficulty) => {
      const roundSeed = seed + difficulty * 1000
      const random = seededRandom(roundSeed)

      // Check for scheduled category first
      const scheduledCategory = allCategories.find(
        (c) => c.difficulty === difficulty && c.scheduledDate === targetDate
      )

      // Filter unscheduled categories for random fallback
      const unscheduledCategories = allCategories.filter(
        (c) => c.difficulty === difficulty && !c.scheduledDate
      )

      // Use scheduled if available, otherwise random
      let category = scheduledCategory
      if (!category) {
        if (unscheduledCategories.length === 0) return null
        const shuffledCategories = shuffleWithSeed(unscheduledCategories, random)
        category = shuffledCategories[0]
      }

      // Shuffle and pick 4 items
      const shuffledItems = shuffleWithSeed([...category.items], random)
      const selectedItems = shuffledItems.slice(0, 4)

      // Pick 1 outlier
      const shuffledOutliers = shuffleWithSeed([...category.outliers], random)
      const outlier = shuffledOutliers[0]

      // Combine and shuffle
      const allItems = [...selectedItems, outlier]
      const finalItems = shuffleWithSeed(allItems, random)
      const outlierIndex = finalItems.indexOf(outlier)

      return {
        items: finalItems,
        outlierIndex,
        connection: category.connection,
        difficulty: difficultyMap[difficulty as 1 | 2 | 3],
      }
    })

    // Filter out any null rounds
    const validRounds = rounds.filter(Boolean)

    if (validRounds.length < 3) {
      return NextResponse.json(
        { error: 'Not enough categories for all difficulties' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      dayNum,
      date: targetDate,
      rounds: validRounds,
    })
  } catch (error) {
    console.error('Failed to fetch daily puzzle:', error)
    return NextResponse.json({ error: 'Failed to fetch puzzle' }, { status: 500 })
  }
}
