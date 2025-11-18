import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get all available skills
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const skills = await prisma.skill.findMany({
      include: {
        competency: {
          select: {
            id: true,
            name: true,
          },
        },
        level: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
      orderBy: [
        { competency: { name: 'asc' } },
        { level: { order: 'asc' } },
      ],
    })

    return NextResponse.json({ skills })
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}
