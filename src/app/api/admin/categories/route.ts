import { NextRequest, NextResponse } from 'next/server'
import { db, categories } from '@/db'
import { eq } from 'drizzle-orm'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// GET all categories
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.difficulty, categories.connection)
    return NextResponse.json(allCategories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { difficulty, connection, items, outliers } = body

    if (!difficulty || !connection || !items || !outliers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (items.length < 4) {
      return NextResponse.json({ error: 'Need at least 4 items' }, { status: 400 })
    }

    if (outliers.length < 1) {
      return NextResponse.json({ error: 'Need at least 1 outlier' }, { status: 400 })
    }

    const newCategory = await db
      .insert(categories)
      .values({
        difficulty,
        connection,
        items,
        outliers,
      })
      .returning()

    return NextResponse.json(newCategory[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

// PUT update category
export async function PUT(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { id, difficulty, connection, items, outliers } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 })
    }

    const updatedCategory = await db
      .update(categories)
      .set({
        difficulty,
        connection,
        items,
        outliers,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning()

    if (updatedCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(updatedCategory[0])
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 })
    }

    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
