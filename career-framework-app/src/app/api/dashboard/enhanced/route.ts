import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateLearningPath } from '@/lib/learning-resources'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    // Get pending assessments
    const pendingAssessments = await prisma.assessmentAssignment.findMany({
      where: {
        agentId: userId,
        status: 'PENDING',
      },
      include: {
        assessment: {
          select: {
            name: true,
            dueDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 5,
    })

    // Get skill progression data
    const assignments = await prisma.assessmentAssignment.findMany({
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

    // Build skill progression data
    const skillMap: Record<string, any> = {}
    assignments.forEach((assignment: any) => {
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
          date: assignment.managerCompletedAt || assignment.createdAt,
          assessment: assignment.assessment.name,
          selfRating: response.selfRating || 0,
          managerRating: response.managerRating || 0,
        })
      })
    })

    // Calculate trends and current ratings
    const recentProgress = Object.values(skillMap).map((skill: any) => {
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

    // Get top skills to improve (lowest ratings, but not at 0)
    const topSkillsToImprove = recentProgress
      .filter((s: any) => s.currentRating > 0 && s.currentRating < 4)
      .sort((a: any, b: any) => a.currentRating - b.currentRating)
      .slice(0, 5)

    // Generate learning resources based on skills to improve
    const skillsForLearning = topSkillsToImprove.map((skill: any) => ({
      name: skill.skillName,
      rating: skill.currentRating,
      priority: (5 - skill.currentRating) * 2,
    }))

    const learningPath = generateLearningPath(skillsForLearning)
    const learningResources = learningPath.flatMap((path: any) => path.resources)

    // Generate achievements based on progress
    const achievements = []

    // Achievement: Completed first assessment
    if (assignments.length >= 1) {
      achievements.push({
        icon: '🎯',
        title: 'First Assessment Complete',
        description: 'You completed your first career assessment',
        date: assignments[0].managerCompletedAt || assignments[0].createdAt,
      })
    }

    // Achievement: Skill improvement
    const improvingSkills = recentProgress.filter(
      (s: any) => s.trendDirection === 'improving' && s.trend >= 1
    )
    if (improvingSkills.length > 0) {
      achievements.push({
        icon: '📈',
        title: `${improvingSkills.length} Skills Improved`,
        description: `You've made progress in ${improvingSkills.length} skill${
          improvingSkills.length !== 1 ? 's' : ''
        }`,
        date: new Date().toISOString(),
      })
    }

    // Achievement: High performer (any skill rated 4 or 5)
    const highRatedSkills = recentProgress.filter((s: any) => s.currentRating >= 4)
    if (highRatedSkills.length > 0) {
      achievements.push({
        icon: '⭐',
        title: 'High Performer',
        description: `Rated 4+ in ${highRatedSkills.length} skill${
          highRatedSkills.length !== 1 ? 's' : ''
        }`,
        date: new Date().toISOString(),
      })
    }

    // Achievement: Consistent improvement
    const consistentlyImproving = recentProgress.filter(
      (s: any) => s.assessmentCount >= 3 && s.trendDirection === 'improving'
    )
    if (consistentlyImproving.length > 0) {
      achievements.push({
        icon: '🚀',
        title: 'Consistent Growth',
        description: `Showing steady improvement across ${consistentlyImproving.length} skill${
          consistentlyImproving.length !== 1 ? 's' : ''
        }`,
        date: new Date().toISOString(),
      })
    }

    // Get upcoming deadlines
    const upcomingDeadlines = pendingAssessments
      .filter((a: any) => a.assessment.dueDate)
      .map((a: any) => ({
        name: a.assessment.name,
        dueDate: a.assessment.dueDate,
        assignmentId: a.id,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )

    return NextResponse.json({
      pendingAssessments,
      recentProgress,
      topSkillsToImprove,
      achievements: achievements.slice(0, 3), // Show top 3 achievements
      upcomingDeadlines,
      learningResources: learningResources.slice(0, 10),
    })
  } catch (error) {
    console.error('Enhanced dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
