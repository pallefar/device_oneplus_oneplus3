import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || (session.user as any).id

    // Verify access
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userId !== (session.user as any).id) {
      // Leaders can only view their direct reports
      if (userRole !== 'LEADER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Get all finalized assignments for this user
    const assignments = await prisma.assignment.findMany({
      where: {
        agentId: userId,
        status: 'FINALIZED',
      },
      include: {
        assessment: {
          select: {
            name: true,
            createdAt: true,
          },
        },
        responses: {
          include: {
            skill: {
              include: {
                competency: true,
              },
            },
          },
        },
      },
      orderBy: {
        managerCompletedAt: 'asc',
      },
    })

    if (assignments.length === 0) {
      return NextResponse.json({ progression: [], message: 'No completed assessments found' })
    }

    // Build skill progression data
    const skillMap: Record<string, any> = {}

    assignments.forEach((assignment: any) => {
      const assessmentDate = assignment.managerCompletedAt || assignment.createdAt
      assignment.responses.forEach((response: any) => {
        const skillId = response.skillId
        if (!skillMap[skillId]) {
          skillMap[skillId] = {
            skillId,
            skillName: response.skill.name,
            competency: response.skill.competency.name,
            dataPoints: [],
          }
        }

        skillMap[skillId].dataPoints.push({
          date: assessmentDate,
          assessment: assignment.assessment.name,
          selfRating: response.selfRating || 0,
          managerRating: response.managerRating || 0,
        })
      })
    })

    // Calculate trends for each skill
    const progression = Object.values(skillMap).map((skill: any) => {
      const firstRating = skill.dataPoints[0].managerRating
      const lastRating = skill.dataPoints[skill.dataPoints.length - 1].managerRating
      const trend = lastRating - firstRating

      return {
        ...skill,
        trend,
        trendDirection: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
        currentRating: lastRating,
        assessmentCount: skill.dataPoints.length,
      }
    })

    // Sort by most recent activity and improvement
    progression.sort((a: any, b: any) => {
      if (Math.abs(b.trend) !== Math.abs(a.trend)) {
        return Math.abs(b.trend) - Math.abs(a.trend)
      }
      return b.currentRating - a.currentRating
    })

    return NextResponse.json({ progression })
  } catch (error) {
    console.error('Skill progression error:', error)
    return NextResponse.json({ error: 'Failed to fetch skill progression' }, { status: 500 })
  }
}
