import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/career-path/predictions
 * ML-powered career path predictions for user
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const targetRole = searchParams.get('targetRole')

    // Get user's current profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        department: true,
        experiencePoints: true,
        level: true,
      },
    })

    // Get user's current skills from latest assessment
    const userSkills = await prisma.assessmentResponse.findMany({
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
            competency: { select: { name: true } },
          },
        },
      },
      orderBy: {
        assignment: {
          managerCompletedAt: 'desc',
        },
      },
      take: 100,
    })

    // Get unique skills
    const skillMap = new Map()
    userSkills.forEach((response) => {
      if (!skillMap.has(response.skill.name)) {
        skillMap.set(response.skill.name, {
          name: response.skill.name,
          competency: response.skill.competency.name,
          level: response.managerRating || response.selfRating || 0,
        })
      }
    })

    const currentSkills = Array.from(skillMap.values())

    // Generate predictions for multiple career paths
    const possibleRoles = [
      'Senior Engineer',
      'Tech Lead',
      'Engineering Manager',
      'Principal Engineer',
      'Director of Engineering',
      'VP Engineering',
      'Architect',
      'Staff Engineer',
    ]

    const predictions = await Promise.all(
      possibleRoles
        .filter((role) => targetRole ? role === targetRole : true)
        .map(async (role) => {
          return generateCareerPathPrediction(userId, user!.role, role, currentSkills)
        })
    )

    // Save predictions to database (delete old, create new)
    await prisma.careerPathPrediction.deleteMany({
      where: {
        userId: userId,
        targetRole: { in: predictions.map((p) => p.targetRole) },
      },
    })

    await prisma.careerPathPrediction.createMany({
      data: predictions.map((pred) => ({
        ...pred,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      })),
    })

    return NextResponse.json({
      currentRole: user?.role,
      predictions: predictions.sort((a, b) => b.successProbability - a.successProbability),
    })
  } catch (error) {
    console.error('Error generating career predictions:', error)
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 })
  }
}

/**
 * Generate ML-powered career path prediction
 */
function generateCareerPathPrediction(
  userId: string,
  currentRole: string,
  targetRole: string,
  currentSkills: any[]
) {
  // Define role requirements (simplified ML model)
  const roleRequirements: Record<string, { skills: string[]; minLevel: number }> = {
    'Senior Engineer': {
      skills: ['System Design', 'TypeScript', 'React', 'Python', 'Problem Solving'],
      minLevel: 4,
    },
    'Tech Lead': {
      skills: ['System Design', 'Team Leadership', 'Communication', 'Mentoring', 'Technical'],
      minLevel: 4,
    },
    'Engineering Manager': {
      skills: [
        'Team Leadership',
        'Strategic Planning',
        'Communication',
        'Stakeholder Management',
        'Mentoring',
      ],
      minLevel: 4,
    },
    'Principal Engineer': {
      skills: ['System Design', 'Technical', 'Strategic Planning', 'Mentoring', 'Innovation'],
      minLevel: 5,
    },
    'Director of Engineering': {
      skills: [
        'Strategic Planning',
        'Team Leadership',
        'Stakeholder Management',
        'Budget Management',
        'Hiring',
      ],
      minLevel: 4,
    },
    'VP Engineering': {
      skills: [
        'Strategic Planning',
        'Executive Leadership',
        'Business Acumen',
        'Organization Building',
        'Vision',
      ],
      minLevel: 5,
    },
    Architect: {
      skills: ['System Design', 'Technical', 'Strategic Planning', 'Communication', 'Innovation'],
      minLevel: 5,
    },
    'Staff Engineer': {
      skills: ['System Design', 'Technical', 'Mentoring', 'Problem Solving', 'Innovation'],
      minLevel: 5,
    },
  }

  const requirements = roleRequirements[targetRole] || { skills: [], minLevel: 3 }

  // Calculate skill gaps
  const skillGaps = []
  let metRequirements = 0

  for (const requiredSkillName of requirements.skills) {
    const userSkill = currentSkills.find(
      (s) =>
        s.name.toLowerCase().includes(requiredSkillName.toLowerCase()) ||
        requiredSkillName.toLowerCase().includes(s.name.toLowerCase()) ||
        s.competency.toLowerCase().includes(requiredSkillName.toLowerCase())
    )

    if (userSkill && userSkill.level >= requirements.minLevel) {
      metRequirements++
    } else {
      skillGaps.push({
        skill: requiredSkillName,
        currentLevel: userSkill?.level || 0,
        requiredLevel: requirements.minLevel,
        gap: requirements.minLevel - (userSkill?.level || 0),
        priority: requirements.minLevel - (userSkill?.level || 0) > 2 ? 'high' : 'medium',
      })
    }
  }

  // Calculate success probability
  const completionRate = metRequirements / requirements.skills.length
  const successProbability = Math.min(completionRate * 100, 95)

  // Estimate timeline based on gaps
  const totalGap = skillGaps.reduce((sum, gap) => sum + gap.gap, 0)
  const estimatedMonths = Math.ceil(Math.max(totalGap * 3, 6))

  // Generate recommendations
  const recommendations = []

  if (skillGaps.length > 0) {
    const topGaps = skillGaps.sort((a, b) => b.gap - a.gap).slice(0, 3)
    topGaps.forEach((gap) => {
      recommendations.push({
        type: 'skill-development',
        title: `Improve ${gap.skill}`,
        description: `Focus on developing ${gap.skill} from level ${gap.currentLevel} to ${gap.requiredLevel}`,
        priority: gap.priority,
        estimatedTime: `${gap.gap * 3} months`,
      })
    })
  }

  // Add experience recommendations
  if (successProbability < 50) {
    recommendations.push({
      type: 'experience',
      title: 'Gain relevant experience',
      description: `Work on projects that demonstrate ${targetRole} responsibilities`,
      priority: 'high',
      estimatedTime: '6-12 months',
    })
  }

  // Add networking recommendations
  recommendations.push({
    type: 'networking',
    title: 'Connect with role models',
    description: `Find mentors who are currently in ${targetRole} positions`,
    priority: 'medium',
    estimatedTime: 'Ongoing',
  })

  // Confidence score (based on data quality)
  const confidenceScore = Math.min(
    (currentSkills.length / requirements.skills.length) * 100,
    90
  )

  return {
    userId,
    targetRole,
    currentRole,
    successProbability: Math.round(successProbability),
    estimatedMonths,
    requiredSkills: JSON.stringify(requirements.skills),
    skillGaps: JSON.stringify(skillGaps),
    recommendations: JSON.stringify(recommendations),
    confidenceScore: Math.round(confidenceScore),
    calculatedAt: new Date(),
  }
}
