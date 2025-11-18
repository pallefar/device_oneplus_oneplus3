import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assignmentId } = body

    // Get the assignment with all responses
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        responses: {
          include: {
            skill: {
              include: {
                competency: true,
                level: true,
              },
            },
          },
        },
        agent: true,
        assessment: {
          include: {
            framework: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Calculate skill gaps
    const skillGaps = assignment.responses
      .filter((r: any) => r.managerRating && r.selfRating)
      .map((r: any) => ({
        skill: r.skill.name,
        competency: r.skill.competency.name,
        expectedLevel: r.skill.level.name,
        selfRating: r.selfRating,
        managerRating: r.managerRating,
        gap: r.selfRating - r.managerRating,
        priority: calculatePriority(r.managerRating, r.selfRating),
      }))
      .sort((a: any, b: any) => b.priority - a.priority)

    // Generate development recommendations
    const developmentPlan = {
      assignmentId,
      agentName: assignment.agent.name,
      framework: assignment.assessment.framework.name,
      generatedAt: new Date(),
      skillGaps,
      recommendations: generateRecommendations(skillGaps),
      timeline: generateTimeline(skillGaps),
    }

    return NextResponse.json(developmentPlan)
  } catch (error) {
    console.error('Development plan error:', error)
    return NextResponse.json({ error: 'Failed to generate development plan' }, { status: 500 })
  }
}

function calculatePriority(managerRating: number, selfRating: number): number {
  // Lower manager rating = higher priority
  // Larger gap = higher priority
  const gapFactor = Math.abs(selfRating - managerRating)
  const levelFactor = 5 - managerRating
  return levelFactor * 2 + gapFactor
}

function generateRecommendations(skillGaps: any[]): any[] {
  const recommendations: any[] = []

  // Group by competency
  const byCompetency: Record<string, any[]> = {}
  skillGaps.forEach((gap: any) => {
    if (!byCompetency[gap.competency]) {
      byCompetency[gap.competency] = []
    }
    byCompetency[gap.competency].push(gap)
  })

  // Generate recommendations per competency
  Object.entries(byCompetency).forEach(([competency, gaps]) => {
    const avgGap =
      gaps.reduce((sum: any, g: any) => sum + (5 - g.managerRating), 0) / gaps.length

    if (avgGap >= 2) {
      recommendations.push({
        competency,
        priority: 'High',
        type: 'Formal Training',
        action: `Enroll in structured ${competency} training program`,
        timeline: '3-6 months',
        skills: gaps.map((g: any) => g.skill),
      })
    } else if (avgGap >= 1) {
      recommendations.push({
        competency,
        priority: 'Medium',
        type: 'Mentorship',
        action: `Pair with senior mentor for ${competency} development`,
        timeline: '2-4 months',
        skills: gaps.map((g: any) => g.skill),
      })
    } else {
      recommendations.push({
        competency,
        priority: 'Low',
        type: 'On-the-job Learning',
        action: `Practice ${competency} skills in daily work`,
        timeline: '1-2 months',
        skills: gaps.map((g: any) => g.skill),
      })
    }
  })

  return recommendations.sort((a: any, b: any) => {
    const priorityOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

function generateTimeline(skillGaps: any[]): any[] {
  const timeline: any[] = []

  // Immediate (0-30 days)
  const immediate = skillGaps.filter((g: any) => g.managerRating <= 2).slice(0, 3)
  if (immediate.length > 0) {
    timeline.push({
      phase: 'Immediate (0-30 days)',
      focus: 'Critical skill gaps',
      goals: immediate.map((g: any) => ({
        skill: g.skill,
        action: `Begin focused practice on ${g.skill}`,
        target: 'Achieve rating of 3',
      })),
    })
  }

  // Short-term (1-3 months)
  const shortTerm = skillGaps.filter((g: any) => g.managerRating === 3).slice(0, 4)
  if (shortTerm.length > 0) {
    timeline.push({
      phase: 'Short-term (1-3 months)',
      focus: 'Competency building',
      goals: shortTerm.map((g: any) => ({
        skill: g.skill,
        action: `Strengthen ${g.skill} through projects`,
        target: 'Achieve rating of 4',
      })),
    })
  }

  // Medium-term (3-6 months)
  const mediumTerm = skillGaps.filter((g: any) => g.managerRating === 4).slice(0, 3)
  if (mediumTerm.length > 0) {
    timeline.push({
      phase: 'Medium-term (3-6 months)',
      focus: 'Excellence and mastery',
      goals: mediumTerm.map((g: any) => ({
        skill: g.skill,
        action: `Master ${g.skill} and mentor others`,
        target: 'Achieve rating of 5',
      })),
    })
  }

  return timeline
}
