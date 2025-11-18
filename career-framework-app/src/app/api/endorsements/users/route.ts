import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get users that can be endorsed
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Get all users except current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          { role: 'AGENT' }, // Only agents can be endorsed
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { department: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        avatarUrl: true,
      },
      take: 20,
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
