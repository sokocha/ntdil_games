import { NextResponse } from 'next/server'
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

// Get day number since launch
function getDayNumber(): number {
  const start = new Date('2026-01-09').setHours(0, 0, 0, 0)
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
}

// GET daily puzzle for Outliers
export async function GET() {
  try {
    const allCategories = await db.select().from(categories)

    if (allCategories.length === 0) {
      return NextResponse.json({ error: 'No categories in database' }, { status: 404 })
    }

    const dayNum = getDayNumber()
    const seed = dayNum * 9973

    // Generate rounds for each difficulty
    const rounds = [1, 2, 3].map((difficulty) => {
      const roundSeed = seed + difficulty * 1000
      const random = seededRandom(roundSeed)

      const validCategories = allCategories.filter((c) => c.difficulty === difficulty)
      if (validCategories.length === 0) return null

      // Pick a category
      const shuffledCategories = shuffleWithSeed(validCategories, random)
      const category = shuffledCategories[0]

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
      rounds: validRounds,
    })
  } catch (error) {
    console.error('Failed to fetch daily puzzle:', error)
    return NextResponse.json({ error: 'Failed to fetch puzzle' }, { status: 500 })
  }
}
