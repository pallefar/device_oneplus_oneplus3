import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/market-intelligence
 * Returns skill trends and market intelligence data
 * Query params:
 *  - skillId: Filter by specific skill
 *  - limit: Number of trends to return (default: 20)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const skillId = searchParams.get('skillId')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get skill trends from database
    let where: any = {}
    if (skillId) {
      where.skillId = skillId
    }

    const trends = await prisma.skillTrend.findMany({
      where,
      orderBy: {
        recordedAt: 'desc',
      },
      take: limit,
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            competency: true,
          },
        },
      },
    })

    // If no trends in database, return sample data
    if (trends.length === 0) {
      const sampleTrends = await generateSampleTrends()
      return NextResponse.json({
        trends: sampleTrends,
        isSampleData: true,
        message: 'Sample market intelligence data. Configure real data sources in Admin Settings.'
      })
    }

    return NextResponse.json({ trends, isSampleData: false })
  } catch (error) {
    console.error('Error fetching market intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market intelligence' },
      { status: 500 }
    )
  }
}

/**
 * Generate sample skill trend data for demonstration
 */
async function generateSampleTrends() {
  const skills = await prisma.skill.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
      competency: true,
    },
  })

  const sampleTrends = skills.map((skill, index) => {
    // Generate realistic trending data
    const demandScore = 60 + Math.random() * 40 // 60-100
    const avgSalary = 80000 + Math.floor(Math.random() * 70000) // $80k-$150k
    const jobCount = Math.floor(100 + Math.random() * 900) // 100-1000 jobs
    const growthRate = (Math.random() * 30) - 5 // -5% to +25%

    return {
      id: `sample-${skill.id}`,
      skillId: skill.id,
      skill: {
        id: skill.id,
        name: skill.name,
        competency: skill.competency,
      },
      demandScore: Math.round(demandScore),
      trendDirection: growthRate > 0 ? 'up' : 'down',
      jobCount,
      avgSalary,
      growthRate: parseFloat(growthRate.toFixed(2)),
      sources: ['LinkedIn', 'Indeed', 'Glassdoor'],
      recordedAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000), // Weekly data
      metadata: {
        topCompanies: ['Tech Corp', 'Innovation Inc', 'Digital Solutions'],
        topLocations: ['San Francisco, CA', 'New York, NY', 'Austin, TX'],
        requiredExperience: '3-5 years',
        relatedSkills: skills
          .filter(s => s.id !== skill.id)
          .slice(0, 3)
          .map(s => s.name),
      },
    }
  })

  return sampleTrends
}

/**
 * POST /api/market-intelligence
 * Cache new market intelligence data (Admin only)
 * Body:
 *  - skillId: string
 *  - demandScore: number (0-100)
 *  - trendDirection: 'up' | 'down' | 'stable'
 *  - jobCount: number
 *  - avgSalary: number
 *  - growthRate: number
 *  - sources: string[]
 *  - metadata: object
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const {
      skillId,
      demandScore,
      trendDirection,
      jobCount,
      avgSalary,
      growthRate,
      sources,
      metadata,
    } = body

    // Validate input
    if (!skillId || demandScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create skill trend
    const trend = await prisma.skillTrend.create({
      data: {
        skillId,
        demandScore,
        trendDirection,
        jobCount,
        avgSalary,
        growthRate,
        sources: JSON.stringify(sources || []),
        metadata: metadata ? JSON.stringify(metadata) : null,
        recordedAt: new Date(),
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            competency: true,
          },
        },
      },
    })

    return NextResponse.json({ trend }, { status: 201 })
  } catch (error) {
    console.error('Error creating market intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to create market intelligence' },
      { status: 500 }
    )
  }
}
