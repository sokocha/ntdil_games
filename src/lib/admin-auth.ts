import { NextRequest, NextResponse } from 'next/server'

export function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '').trim()
  const secret = process.env.ADMIN_SECRET?.trim()

  if (!secret) {
    console.error('ADMIN_SECRET environment variable is not set')
    return false
  }

  return token === secret
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      hint: !process.env.ADMIN_SECRET ? 'ADMIN_SECRET not configured' : undefined,
    },
    { status: 401 }
  )
}
