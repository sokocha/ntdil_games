import { NextRequest, NextResponse } from 'next/server'
import { db, players, categories } from '@/db'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

const MAX_DAYS = 90 // 3 months maximum

interface SquaddlePlayerInput {
  playerId: string
  name: string
  acceptedAnswers: string[]
  clues: {
    position: string
    trophies: string
    stats: string
    international: string
    clubs: string
    hint: string
  }
}

interface SquaddleDayInput {
  easy: SquaddlePlayerInput
  medium: SquaddlePlayerInput
  hard: SquaddlePlayerInput
}

interface OutliersCategoryInput {
  connection: string
  items: string[]
  outliers: string[]
}

interface OutliersDayInput {
  easy: OutliersCategoryInput
  medium: OutliersCategoryInput
  hard: OutliersCategoryInput
}

interface SquaddleUpload {
  type: 'squaddle'
  days: SquaddleDayInput[]
}

interface OutliersUpload {
  type: 'outliers'
  days: OutliersDayInput[]
}

type UploadData = SquaddleUpload | OutliersUpload

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// POST to upload game data
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { data, startDate } = body as { data: UploadData; startDate: string }

    if (!data || !startDate) {
      return NextResponse.json({ error: 'Missing data or startDate' }, { status: 400 })
    }

    if (!data.type || !data.days || !Array.isArray(data.days)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected { type, days: [] }' },
        { status: 400 }
      )
    }

    if (data.days.length > MAX_DAYS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_DAYS} days (3 months) allowed` },
        { status: 400 }
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    const endDate = addDays(startDate, data.days.length - 1)
    let insertedCount = 0

    if (data.type === 'squaddle') {
      for (let i = 0; i < data.days.length; i++) {
        const day = data.days[i] as SquaddleDayInput
        const scheduledDate = addDays(startDate, i)

        for (const difficulty of ['easy', 'medium', 'hard'] as const) {
          const player = day[difficulty]
          if (player) {
            await db.insert(players).values({
              playerId: `${player.playerId}_${scheduledDate}`,
              name: player.name,
              acceptedAnswers: player.acceptedAnswers,
              clues: player.clues,
              difficulty,
              scheduledDate,
            })
            insertedCount++
          }
        }
      }
    } else if (data.type === 'outliers') {
      for (let i = 0; i < data.days.length; i++) {
        const day = data.days[i] as OutliersDayInput
        const scheduledDate = addDays(startDate, i)

        const difficultyMap = { easy: 1, medium: 2, hard: 3 } as const

        for (const difficulty of ['easy', 'medium', 'hard'] as const) {
          const category = day[difficulty]
          if (category) {
            await db.insert(categories).values({
              difficulty: difficultyMap[difficulty],
              connection: category.connection,
              items: category.items,
              outliers: category.outliers,
              scheduledDate,
            })
            insertedCount++
          }
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "squaddle" or "outliers"' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${data.days.length} days of ${data.type} data`,
      days: data.days.length,
      items: insertedCount,
      startDate,
      endDate,
    })
  } catch (error) {
    console.error('Failed to upload data:', error)
    return NextResponse.json({ error: 'Failed to upload data' }, { status: 500 })
  }
}
