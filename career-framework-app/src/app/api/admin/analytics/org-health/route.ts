import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/analytics/org-health
 * Comprehensive organizational health analytics dashboard
 * Returns metrics on users, assessments, skills, engagement, trends
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '30' // days
    const days = parseInt(timeRange)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // 1. User Statistics
    const totalUsers = await prisma.user.count()
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    })

    const newUsersInRange = await prisma.user.count({
      where: { createdAt: { gte: startDate } },
    })

    // 2. Assessment Statistics
    const totalAssessments = await prisma.assessmentAssignment.count()
    const assessmentsByStatus = await prisma.assessmentAssignment.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const assessmentsInRange = await prisma.assessmentAssignment.count({
      where: { createdAt: { gte: startDate } },
    })

    const completedAssessments = await prisma.assessmentAssignment.count({
      where: { status: 'FINALIZED' },
    })

    const completionRate =
      totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0

    // 3. Skill & Learning Statistics
    const totalSkills = await prisma.skill.count()
    const totalFrameworks = await prisma.careerFramework.count()

    const activeGoals = await prisma.learningGoal.count({
      where: { status: 'active' },
    })

    const completedGoals = await prisma.learningGoal.count({
      where: { status: 'completed' },
    })

    const goalsCompletionRate =
      activeGoals + completedGoals > 0
        ? (completedGoals / (activeGoals + completedGoals)) * 100
        : 0

    // 4. Engagement Metrics
    const totalEndorsements = await prisma.skillEndorsement.count()
    const endorsementsInRange = await prisma.skillEndorsement.count({
      where: { createdAt: { gte: startDate } },
    })

    const totalKudos = await prisma.kudos.count()
    const kudosInRange = await prisma.kudos.count({
      where: { createdAt: { gte: startDate } },
    })

    const totalAchievements = await prisma.achievement.count()
    const totalUnlockedAchievements = await prisma.userAchievement.count()
    const achievementUnlockRate =
      totalUsers * totalAchievements > 0
        ? (totalUnlockedAchievements / (totalUsers * totalAchievements)) * 100
        : 0

    const totalAIConversations = await prisma.aIConversation.count()
    const aiConversationsInRange = await prisma.aIConversation.count({
      where: { createdAt: { gte: startDate } },
    })

    // 5. Top Skills by Assessment Ratings
    const topSkills = await prisma.assessmentResponse.groupBy({
      by: ['skillId'],
      _avg: {
        managerRating: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _avg: {
          managerRating: 'desc',
        },
      },
      take: 10,
    })

    const topSkillsWithNames = await Promise.all(
      topSkills.map(async (skill) => {
        const skillData = await prisma.skill.findUnique({
          where: { id: skill.skillId },
          select: { name: true, competency: true },
        })
        return {
          skillId: skill.skillId,
          name: skillData?.name || 'Unknown',
          competency: skillData?.competency || 'Unknown',
          avgRating: skill._avg.managerRating || 0,
          assessmentCount: skill._count.id,
        }
      })
    )

    // 6. Most Active Users (by XP)
    const topUsersByXP = await prisma.user.findMany({
      orderBy: { experiencePoints: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        experiencePoints: true,
        level: true,
        role: true,
        department: true,
      },
    })

    // 7. Most Endorsed Users
    const mostEndorsedUsers = await prisma.skillEndorsement.groupBy({
      by: ['endorseeId'],
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' },
      },
      take: 10,
    })

    const mostEndorsedWithNames = await Promise.all(
      mostEndorsedUsers.map(async (endorsee) => {
        const user = await prisma.user.findUnique({
          where: { id: endorsee.endorseeId },
          select: { name: true, role: true, department: true },
        })
        return {
          userId: endorsee.endorseeId,
          name: user?.name || 'Unknown',
          role: user?.role,
          department: user?.department,
          endorsementCount: endorsee._count.id,
        }
      })
    )

    // 8. Department Breakdown
    const usersByDepartment = await prisma.user.groupBy({
      by: ['department'],
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' },
      },
    })

    // 9. Activity Timeline (last 30 days)
    const activityTimeline = []
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const [assessments, endorsements, kudos, goals, conversations] =
        await Promise.all([
          prisma.assessmentAssignment.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
          prisma.skillEndorsement.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
          prisma.kudos.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
          prisma.learningGoal.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
          prisma.aIConversation.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
        ])

      activityTimeline.push({
        date: dayStart.toISOString().split('T')[0],
        assessments,
        endorsements,
        kudos,
        goals,
        conversations,
      })
    }

    // 10. Skills Gap Analysis
    const skillsWithLowRatings = await prisma.assessmentResponse.groupBy({
      by: ['skillId'],
      _avg: {
        selfRating: true,
        managerRating: true,
      },
      _count: {
        id: true,
      },
      having: {
        selfRating: {
          _avg: {
            lt: 3, // Skills with average rating below 3
          },
        },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    const skillGaps = await Promise.all(
      skillsWithLowRatings.map(async (skill) => {
        const skillData = await prisma.skill.findUnique({
          where: { id: skill.skillId },
          select: { name: true, competency: true },
        })
        return {
          skillId: skill.skillId,
          name: skillData?.name || 'Unknown',
          competency: skillData?.competency || 'Unknown',
          avgSelfRating: skill._avg.selfRating || 0,
          avgManagerRating: skill._avg.managerRating || 0,
          affectedUsers: skill._count.id,
        }
      })
    )

    return NextResponse.json({
      timeRange: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      users: {
        total: totalUsers,
        byRole: usersByRole,
        newInRange: newUsersInRange,
        byDepartment: usersByDepartment,
        topByXP: topUsersByXP,
        mostEndorsed: mostEndorsedWithNames,
      },
      assessments: {
        total: totalAssessments,
        completed: completedAssessments,
        completionRate: Math.round(completionRate * 10) / 10,
        byStatus: assessmentsByStatus,
        inRange: assessmentsInRange,
      },
      skills: {
        total: totalSkills,
        frameworks: totalFrameworks,
        topSkills: topSkillsWithNames,
        gaps: skillGaps,
      },
      learning: {
        activeGoals,
        completedGoals,
        goalsCompletionRate: Math.round(goalsCompletionRate * 10) / 10,
      },
      engagement: {
        endorsements: {
          total: totalEndorsements,
          inRange: endorsementsInRange,
        },
        kudos: {
          total: totalKudos,
          inRange: kudosInRange,
        },
        aiConversations: {
          total: totalAIConversations,
          inRange: aiConversationsInRange,
        },
        achievements: {
          total: totalAchievements,
          unlocked: totalUnlockedAchievements,
          unlockRate: Math.round(achievementUnlockRate * 10) / 10,
        },
      },
      activityTimeline,
    })
  } catch (error) {
    console.error('Error fetching org health analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
