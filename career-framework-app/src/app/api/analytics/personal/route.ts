import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/analytics/personal
 * Personal career analytics for the logged-in user
 * Returns comprehensive insights about their career progress
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // 1. User Profile & Gamification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        role: true,
        department: true,
        experiencePoints: true,
        level: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2. Career Timeline (Assessments)
    const assessments = await prisma.assessmentAssignment.findMany({
      where: { agentId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        assessment: {
          select: {
            name: true,
            framework: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    const totalAssessments = await prisma.assessmentAssignment.count({
      where: { agentId: userId },
    })

    const completedAssessments = await prisma.assessmentAssignment.count({
      where: { agentId: userId, status: 'FINALIZED' },
    })

    // 3. Skills Performance
    const skillRatings = await prisma.assessmentResponse.findMany({
      where: {
        assignment: {
          agentId: userId,
          status: 'FINALIZED',
        },
      },
      include: {
        skill: {
          select: {
            name: true,
            competency: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Group skills by competency
    const skillsByCompetency: Record<string, any[]> = {}
    const skillTrends: Record<string, any[]> = {}

    skillRatings.forEach((rating) => {
      const competency = rating.skill.competency
      if (!skillsByCompetency[competency]) {
        skillsByCompetency[competency] = []
      }
      skillsByCompetency[competency].push({
        skillName: rating.skill.name,
        selfRating: rating.selfRating || 0,
        managerRating: rating.managerRating || 0,
        gap: (rating.managerRating || 0) - (rating.selfRating || 0),
        updatedAt: rating.updatedAt,
      })

      // Track skill progression over time
      if (!skillTrends[rating.skill.name]) {
        skillTrends[rating.skill.name] = []
      }
      skillTrends[rating.skill.name].push({
        date: rating.updatedAt,
        selfRating: rating.selfRating || 0,
        managerRating: rating.managerRating || 0,
      })
    })

    // Calculate competency averages
    const competencyAverages = Object.entries(skillsByCompetency).map(
      ([competency, skills]) => {
        const avgSelf =
          skills.reduce((sum, s) => sum + s.selfRating, 0) / skills.length
        const avgManager =
          skills.reduce((sum, s) => sum + s.managerRating, 0) / skills.length
        return {
          competency,
          avgSelf: Math.round(avgSelf * 10) / 10,
          avgManager: Math.round(avgManager * 10) / 10,
          skillCount: skills.length,
        }
      }
    )

    // 4. Top Strengths & Growth Areas
    const topStrengths = skillRatings
      .filter((r) => (r.managerRating || 0) >= 4)
      .slice(0, 10)
      .map((r) => ({
        skill: r.skill.name,
        competency: r.skill.competency,
        rating: r.managerRating,
      }))

    const growthAreas = skillRatings
      .filter((r) => (r.managerRating || 0) < 3)
      .slice(0, 10)
      .map((r) => ({
        skill: r.skill.name,
        competency: r.skill.competency,
        rating: r.managerRating,
        selfRating: r.selfRating,
      }))

    // 5. Learning Goals Progress
    const activeGoals = await prisma.learningGoal.findMany({
      where: { userId, status: 'active' },
      include: {
        skill: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const completedGoals = await prisma.learningGoal.findMany({
      where: { userId, status: 'completed' },
      include: {
        skill: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
    })

    const totalGoals = activeGoals.length + completedGoals.length
    const goalsCompletionRate =
      totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0

    // 6. Endorsements
    const receivedEndorsements = await prisma.skillEndorsement.findMany({
      where: { endorseeId: userId },
      include: {
        skill: {
          select: {
            name: true,
          },
        },
        endorser: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const givenEndorsements = await prisma.skillEndorsement.count({
      where: { endorserId: userId },
    })

    // Group endorsements by skill
    const endorsementsBySkill: Record<string, number> = {}
    receivedEndorsements.forEach((endorsement) => {
      const skillName = endorsement.skill.name
      endorsementsBySkill[skillName] = (endorsementsBySkill[skillName] || 0) + 1
    })

    const topEndorsedSkills = Object.entries(endorsementsBySkill)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 7. Achievements & Badges
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: {
            name: true,
            description: true,
            icon: true,
            xpReward: true,
            tier: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
    })

    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: {
          select: {
            name: true,
            description: true,
            icon: true,
            color: true,
            rarity: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
    })

    // 8. XP History (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const xpTransactions = await prisma.xPTransaction.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group XP by day
    const xpByDay: Record<string, number> = {}
    xpTransactions.forEach((tx) => {
      const day = tx.createdAt.toISOString().split('T')[0]
      xpByDay[day] = (xpByDay[day] || 0) + tx.amount
    })

    const xpTimeline = Object.entries(xpByDay).map(([date, amount]) => ({
      date,
      amount,
    }))

    // 9. Kudos
    const receivedKudos = await prisma.kudos.count({
      where: { receiverId: userId },
    })

    const givenKudos = await prisma.kudos.count({
      where: { giverId: userId },
    })

    const recentKudos = await prisma.kudos.findMany({
      where: { receiverId: userId },
      include: {
        giver: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // 10. AI Conversations
    const aiConversations = await prisma.aIConversation.count({
      where: { userId },
    })

    const recentConversations = await prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        provider: true,
        messageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // 11. Rank Comparison
    const allUsersXP = await prisma.user.findMany({
      select: {
        id: true,
        experiencePoints: true,
      },
      orderBy: {
        experiencePoints: 'desc',
      },
    })

    const userRank =
      allUsersXP.findIndex((u) => u.id === userId) + 1
    const totalUsers = allUsersXP.length
    const percentile = ((totalUsers - userRank) / totalUsers) * 100

    return NextResponse.json({
      profile: {
        ...user,
        rank: userRank,
        totalUsers,
        percentile: Math.round(percentile),
      },
      assessments: {
        total: totalAssessments,
        completed: completedAssessments,
        completionRate:
          totalAssessments > 0
            ? Math.round((completedAssessments / totalAssessments) * 100)
            : 0,
        recent: assessments.map((a) => ({
          id: a.id,
          name: a.assessment.name,
          framework: a.assessment.framework.name,
          status: a.status,
          createdAt: a.createdAt,
          completedAt: a.managerCompletedAt,
        })),
      },
      skills: {
        byCompetency: skillsByCompetency,
        competencyAverages,
        topStrengths,
        growthAreas,
        trends: skillTrends,
      },
      learning: {
        activeGoals: activeGoals.map((g) => ({
          id: g.id,
          title: g.title,
          skill: g.skill?.name,
          progress: g.progress,
          targetDate: g.targetDate,
        })),
        completedGoals: completedGoals.map((g) => ({
          id: g.id,
          title: g.title,
          skill: g.skill?.name,
          completedAt: g.completedAt,
        })),
        completionRate: Math.round(goalsCompletionRate),
      },
      endorsements: {
        received: receivedEndorsements.length,
        given: givenEndorsements,
        topSkills: topEndorsedSkills,
        recent: receivedEndorsements.slice(0, 5).map((e) => ({
          skill: e.skill.name,
          endorser: e.endorser.name,
          endorserRole: e.endorser.role,
          comment: e.comment,
          createdAt: e.createdAt,
        })),
      },
      gamification: {
        achievements: achievements.map((a) => ({
          name: a.achievement.name,
          description: a.achievement.description,
          icon: a.achievement.icon,
          tier: a.achievement.tier,
          xpReward: a.achievement.xpReward,
          earnedAt: a.earnedAt,
        })),
        badges: badges.map((b) => ({
          name: b.badge.name,
          description: b.badge.description,
          icon: b.badge.icon,
          color: b.badge.color,
          rarity: b.badge.rarity,
          earnedAt: b.earnedAt,
          isPinned: b.isPinned,
        })),
        xpTimeline,
      },
      social: {
        kudosReceived: receivedKudos,
        kudosGiven: givenKudos,
        recentKudos: recentKudos.map((k) => ({
          message: k.message,
          giver: k.giver.name,
          createdAt: k.createdAt,
        })),
        aiConversations,
        recentConversations: recentConversations.map((c) => ({
          id: c.id,
          provider: c.provider,
          messages: c.messageCount,
          lastActive: c.updatedAt,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching personal analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal analytics' },
      { status: 500 }
    )
  }
}
