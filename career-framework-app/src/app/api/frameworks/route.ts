import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, version, levels, competencies } = body

    // Create framework with related data
    const framework = await prisma.careerFramework.create({
      data: {
        name,
        description,
        version: version || '1.0',
        createdById: (session.user as any).id,
        levels: {
          create: levels.map((level: any, index: number) => ({
            name: level.name,
            description: level.description,
            order: index + 1,
          })),
        },
        competencies: {
          create: competencies.map((comp: any) => ({
            name: comp.name,
            description: comp.description,
          })),
        },
      },
      include: {
        levels: true,
        competencies: true,
      },
    })

    return NextResponse.json(framework)
  } catch (error) {
    console.error('Error creating framework:', error)
    return NextResponse.json(
      { error: 'Failed to create framework' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const frameworks = await prisma.careerFramework.findMany({
      include: {
        levels: true,
        competencies: {
          include: {
            skills: true,
          },
        },
        _count: {
          select: {
            assessments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(frameworks)
  } catch (error) {
    console.error('Error fetching frameworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch frameworks' },
      { status: 500 }
    )
  }
}
