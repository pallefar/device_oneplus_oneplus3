import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/succession-planning
 * Succession planning analysis for leadership pipeline
 * Identifies potential successors for key roles based on skills, performance, and readiness
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const targetRole = searchParams.get('role') // Optional filter by target role

    // 1. Get all users with their assessment data
    const users = await prisma.user.findMany({
      where: targetRole ? { role: { not: 'ADMIN' } } : undefined,
      include: {
        agentAssignments: {
          where: { status: 'FINALIZED' },
          include: {
            responses: {
              include: {
                skill: true,
              },
            },
            assessment: {
              include: {
                framework: true,
              },
            },
          },
          orderBy: { managerCompletedAt: 'desc' },
          take: 1, // Most recent assessment
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
        receivedEndorsements: {
          include: {
            skill: true,
            endorser: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
        learningGoals: {
          where: { status: 'completed' },
        },
      },
    })

    // 2. Calculate succession readiness scores for each user
    const successionCandidates = users
      .map((user) => {
        // Skip if no assessments
        if (user.agentAssignments.length === 0) {
          return null
        }

        const latestAssessment = user.agentAssignments[0]
        const responses = latestAssessment.responses

        // Calculate average skill ratings
        const avgManagerRating =
          responses.reduce((sum, r) => sum + (r.managerRating || 0), 0) /
          responses.length

        const avgSelfRating =
          responses.reduce((sum, r) => sum + (r.selfRating || 0), 0) / responses.length

        // Calculate self-awareness (how aligned self and manager ratings are)
        const selfAwareness =
          1 -
          responses.reduce(
            (sum, r) => sum + Math.abs((r.selfRating || 0) - (r.managerRating || 0)),
            0
          ) /
            (responses.length * 5)

        // Leadership competency score
        const leadershipSkills = responses.filter(
          (r) =>
            r.skill.competency === 'Leadership' || r.skill.competency === 'Management'
        )
        const leadershipScore =
          leadershipSkills.length > 0
            ? leadershipSkills.reduce((sum, r) => sum + (r.managerRating || 0), 0) /
              leadershipSkills.length
            : 0

        // Technical competency score
        const technicalSkills = responses.filter(
          (r) => r.skill.competency === 'Technical' || r.skill.competency === 'Domain'
        )
        const technicalScore =
          technicalSkills.length > 0
            ? technicalSkills.reduce((sum, r) => sum + (r.managerRating || 0), 0) /
              technicalSkills.length
            : 0

        // Growth indicators
        const endorsementCount = user.receivedEndorsements.length
        const achievementCount = user.achievements.length
        const completedGoals = user.learningGoals.length
        const experienceLevel = user.level

        // Calculate overall succession readiness score (0-100)
        const readinessScore = Math.round(
          avgManagerRating * 10 + // 0-50 points from skill ratings
            leadershipScore * 8 + // 0-40 points from leadership
            selfAwareness * 10 + // 0-10 points from self-awareness
            Math.min(endorsementCount * 2, 10) + // 0-10 points from endorsements
            Math.min(achievementCount, 10) + // 0-10 points from achievements
            Math.min(completedGoals * 2, 10) + // 0-10 points from learning goals
            Math.min(experienceLevel, 10) // 0-10 points from XP level
        )

        // Determine readiness level
        let readinessLevel: 'high' | 'medium' | 'low' | 'not-ready'
        if (readinessScore >= 80) readinessLevel = 'high'
        else if (readinessScore >= 60) readinessLevel = 'medium'
        else if (readinessScore >= 40) readinessLevel = 'low'
        else readinessLevel = 'not-ready'

        // Identify development needs
        const developmentNeeds = responses
          .filter((r) => (r.managerRating || 0) < 3)
          .map((r) => ({
            skill: r.skill.name,
            competency: r.skill.competency,
            currentRating: r.managerRating || 0,
            gap: 3 - (r.managerRating || 0),
          }))
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 5)

        // Identify strengths
        const strengths = responses
          .filter((r) => (r.managerRating || 0) >= 4)
          .map((r) => ({
            skill: r.skill.name,
            competency: r.skill.competency,
            rating: r.managerRating || 0,
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5)

        // Suggest next role based on skills and readiness
        let suggestedNextRole = user.role
        if (user.role === 'AGENT' && readinessLevel !== 'not-ready') {
          if (leadershipScore >= 4) suggestedNextRole = 'LEADER'
          else if (avgManagerRating >= 4) suggestedNextRole = 'LEADER'
        }

        // Calculate time to readiness (in months)
        const developmentTime =
          readinessLevel === 'high'
            ? 0
            : readinessLevel === 'medium'
            ? 6
            : readinessLevel === 'low'
            ? 12
            : 24

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          currentRole: user.role,
          department: user.department,
          experiencePoints: user.experiencePoints,
          level: user.level,
          readinessScore,
          readinessLevel,
          suggestedNextRole,
          developmentTime,
          scores: {
            overall: avgManagerRating,
            leadership: leadershipScore,
            technical: technicalScore,
            selfAwareness: Math.round(selfAwareness * 100),
          },
          metrics: {
            endorsements: endorsementCount,
            achievements: achievementCount,
            completedGoals,
          },
          strengths,
          developmentNeeds,
          lastAssessmentDate: latestAssessment.managerCompletedAt,
        }
      })
      .filter((candidate) => candidate !== null)
      .sort((a, b) => b!.readinessScore - a!.readinessScore)

    // 3. Group candidates by readiness level
    const groupedCandidates = {
      high: successionCandidates.filter((c) => c!.readinessLevel === 'high'),
      medium: successionCandidates.filter((c) => c!.readinessLevel === 'medium'),
      low: successionCandidates.filter((c) => c!.readinessLevel === 'low'),
      notReady: successionCandidates.filter((c) => c!.readinessLevel === 'not-ready'),
    }

    // 4. Identify critical roles that need succession planning
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    })

    // 5. Calculate pipeline health score
    const totalCandidates = successionCandidates.length
    const readyCandidates = groupedCandidates.high.length + groupedCandidates.medium.length
    const pipelineHealth =
      totalCandidates > 0 ? Math.round((readyCandidates / totalCandidates) * 100) : 0

    return NextResponse.json({
      summary: {
        totalCandidates,
        readyCandidates,
        pipelineHealth,
        byReadiness: {
          high: groupedCandidates.high.length,
          medium: groupedCandidates.medium.length,
          low: groupedCandidates.low.length,
          notReady: groupedCandidates.notReady.length,
        },
        roleDistribution,
      },
      candidates: successionCandidates,
      grouped: groupedCandidates,
      recommendations: [
        {
          type: 'pipeline-health',
          status: pipelineHealth >= 70 ? 'good' : pipelineHealth >= 50 ? 'fair' : 'poor',
          message:
            pipelineHealth >= 70
              ? 'Strong leadership pipeline with sufficient ready candidates'
              : pipelineHealth >= 50
              ? 'Moderate pipeline - consider accelerated development programs'
              : 'Weak pipeline - immediate action needed to develop leadership bench',
        },
        {
          type: 'development-focus',
          message:
            groupedCandidates.medium.length > 0
              ? `${groupedCandidates.medium.length} candidates are medium-ready and could benefit from targeted development`
              : 'No medium-ready candidates - focus on skill development programs',
        },
      ],
    })
  } catch (error) {
    console.error('Error fetching succession planning data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch succession planning data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/succession-planning
 * Create succession plan for a specific role/user
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { targetRole, candidateIds, notes, timelineMonths } = body

    // Create succession plan record
    const plan = await prisma.successionPlan.create({
      data: {
        targetRole,
        candidateIds: JSON.stringify(candidateIds),
        notes,
        timelineMonths,
        createdBy: (session.user as any).id,
        status: 'active',
      },
    })

    // Create notifications for identified candidates
    for (const candidateId of candidateIds) {
      await prisma.notification.create({
        data: {
          userId: candidateId,
          type: 'succession_identified',
          title: 'Leadership Development Opportunity',
          message: `You've been identified as a potential candidate for ${targetRole}. Your manager will discuss development plans with you.`,
          link: '/agent/learning',
        },
      })
    }

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('Error creating succession plan:', error)
    return NextResponse.json(
      { error: 'Failed to create succession plan' },
      { status: 500 }
    )
  }
}
