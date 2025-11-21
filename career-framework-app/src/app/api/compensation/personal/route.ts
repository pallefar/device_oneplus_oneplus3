import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/compensation/personal
 * Personal skill valuation and compensation insights for logged-in user
 * Privacy-preserving: No individual salary data exposed
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // 1. Get user's skills from latest finalized assessment
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
            competency: {
              select: {
                name: true,
              },
            },
            level: {
              select: {
                order: true,
              },
            },
          },
        },
        assignment: {
          select: {
            managerCompletedAt: true,
          },
        },
      },
      orderBy: {
        assignment: {
          managerCompletedAt: 'desc',
        },
      },
    })

    // Get only the most recent rating for each skill
    const skillMap = new Map()
    userSkills.forEach((response) => {
      if (!skillMap.has(response.skill.name)) {
        skillMap.set(response.skill.name, {
          skillName: response.skill.name,
          competency: response.skill.competency.name,
          level: response.managerRating || response.selfRating || 0,
          selfRating: response.selfRating || 0,
          managerRating: response.managerRating || 0,
        })
      }
    })

    const currentSkills = Array.from(skillMap.values())

    // 2. Get or generate market benchmarks (using realistic sample data)
    // In production, this would query real market data APIs
    const marketBenchmarks = await getMarketBenchmarks()

    // 3. Calculate skill values
    const skillValuations = currentSkills.map((skill) => {
      const benchmark = marketBenchmarks.find((b) => b.skillName === skill.skillName)

      if (!benchmark) {
        // Default valuation for skills without benchmark data
        return {
          skillName: skill.skillName,
          competency: skill.competency,
          currentLevel: skill.level,
          marketValue: skill.level * 5000, // $5k per skill level
          premium: 0,
          demand: 50,
          trend: 'stable' as const,
        }
      }

      // Calculate value based on skill level
      const baseValue = benchmark.baseValue
      const levelMultiplier = skill.level / 5 // Normalize to 0-1
      const marketValue = baseValue * levelMultiplier
      const premium = benchmark.premiumPercent

      return {
        skillName: skill.skillName,
        competency: skill.competency,
        currentLevel: skill.level,
        marketValue: Math.round(marketValue),
        premium: Math.round(premium),
        demand: benchmark.marketDemand,
        trend: benchmark.trend,
      }
    })

    // 4. Calculate total skill portfolio value
    const totalSkillValue = skillValuations.reduce((sum, s) => sum + s.marketValue, 0)

    // 5. Identify high-value skill gaps (skills the user doesn't have but are valuable)
    const userSkillNames = new Set(currentSkills.map((s) => s.skillName))
    const highValueGaps = marketBenchmarks
      .filter((b) => !userSkillNames.has(b.skillName) && b.marketDemand >= 70)
      .sort((a, b) => b.baseValue - a.baseValue)
      .slice(0, 10)
      .map((b) => ({
        skillName: b.skillName,
        competency: b.competency,
        potentialValue: Math.round(b.baseValue * 0.8), // 80% of max value as realistic target
        demand: b.marketDemand,
        premium: b.premiumPercent,
        trend: b.trend,
        estimatedTimeToAcquire: '6-12 months', // Static for now
      }))

    // 6. Calculate market percentile (simulate with user XP)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        experiencePoints: true,
        level: true,
        role: true,
        department: true,
      },
    })

    const allUsersXP = await prisma.user.findMany({
      select: { experiencePoints: true },
    })

    const rank = allUsersXP.filter((u) => u.experiencePoints > (user?.experiencePoints || 0)).length + 1
    const marketPercentile = ((allUsersXP.length - rank) / allUsersXP.length) * 100

    // 7. Generate recommendations
    const recommendations = []

    // Top skill recommendation
    if (highValueGaps.length > 0) {
      const topGap = highValueGaps[0]
      recommendations.push({
        type: 'skill-development',
        priority: 'high',
        title: `Learn ${topGap.skillName} for ${topGap.potentialValue.toLocaleString()} increase`,
        description: `${topGap.skillName} is in high demand (${topGap.demand}/100) and could increase your market value by approximately $${topGap.potentialValue.toLocaleString()}.`,
        action: 'Set learning goal',
        potentialGain: topGap.potentialValue,
      })
    }

    // Skill level-up recommendation
    const improvableSkills = skillValuations.filter((s) => s.currentLevel < 5)
    if (improvableSkills.length > 0) {
      const topImprovable = improvableSkills.sort((a, b) => b.demand - a.demand)[0]
      const gainPerLevel = topImprovable.marketValue / topImprovable.currentLevel
      recommendations.push({
        type: 'level-up',
        priority: 'medium',
        title: `Improve ${topImprovable.skillName} to level ${topImprovable.currentLevel + 1}`,
        description: `Increasing your ${topImprovable.skillName} skill from level ${topImprovable.currentLevel} to ${topImprovable.currentLevel + 1} could add approximately $${Math.round(gainPerLevel).toLocaleString()} to your market value.`,
        action: 'Focus on practice',
        potentialGain: Math.round(gainPerLevel),
      })
    }

    // Trending skills recommendation
    const trendingSkills = highValueGaps.filter((s) => s.trend === 'rising').slice(0, 1)
    if (trendingSkills.length > 0) {
      const trending = trendingSkills[0]
      recommendations.push({
        type: 'trending',
        priority: 'medium',
        title: `${trending.skillName} is trending upward`,
        description: `Market demand for ${trending.skillName} is rising. Early adoption could position you ahead of the curve.`,
        action: 'Start learning',
        potentialGain: trending.potentialValue,
      })
    }

    // Portfolio diversification
    const competencyCounts = new Map<string, number>()
    currentSkills.forEach((s) => {
      competencyCounts.set(s.competency, (competencyCounts.get(s.competency) || 0) + 1)
    })
    const dominantCompetency = Array.from(competencyCounts.entries()).sort((a, b) => b[1] - a[1])[0]

    if (dominantCompetency && dominantCompetency[1] / currentSkills.length > 0.6) {
      recommendations.push({
        type: 'diversification',
        priority: 'low',
        title: 'Diversify your skill portfolio',
        description: `Over 60% of your skills are in ${dominantCompetency[0]}. Consider developing skills in other competencies to increase versatility.`,
        action: 'Explore new areas',
        potentialGain: 0,
      })
    }

    // 8. Calculate potential gains
    const topGains = highValueGaps.slice(0, 5)
    const totalPotentialGain = topGains.reduce((sum, s) => sum + s.potentialValue, 0)

    // 9. Group skills by competency for visualization
    const skillsByCompetency: Record<string, typeof skillValuations> = {}
    skillValuations.forEach((skill) => {
      if (!skillsByCompetency[skill.competency]) {
        skillsByCompetency[skill.competency] = []
      }
      skillsByCompetency[skill.competency].push(skill)
    })

    // 10. Calculate competency values
    const competencyValues = Object.entries(skillsByCompetency).map(([competency, skills]) => ({
      competency,
      totalValue: skills.reduce((sum, s) => sum + s.marketValue, 0),
      avgLevel: skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length,
      skillCount: skills.length,
    }))

    return NextResponse.json({
      profile: {
        userId: user?.id,
        role: user?.role,
        department: user?.department,
        experiencePoints: user?.experiencePoints,
        level: user?.level,
      },
      skillValuation: {
        totalValue: totalSkillValue,
        skillCount: currentSkills.length,
        marketPercentile: Math.round(marketPercentile),
        topSkills: skillValuations
          .sort((a, b) => b.marketValue - a.marketValue)
          .slice(0, 10),
        byCompetency: competencyValues,
      },
      opportunities: {
        highValueGaps,
        totalPotentialGain,
        recommendations,
      },
      marketInsights: {
        trendingSkills: marketBenchmarks
          .filter((b) => b.trend === 'rising')
          .sort((a, b) => b.marketDemand - a.marketDemand)
          .slice(0, 5)
          .map((b) => ({
            skillName: b.skillName,
            demand: b.marketDemand,
            avgValue: Math.round(b.baseValue),
          })),
        decliningSkills: marketBenchmarks
          .filter((b) => b.trend === 'declining')
          .slice(0, 3)
          .map((b) => ({
            skillName: b.skillName,
            demand: b.marketDemand,
          })),
      },
    })
  } catch (error) {
    console.error('Error fetching personal compensation data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compensation data' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get market benchmarks
 * In production, this would fetch from CompensationBenchmark table or external APIs
 */
async function getMarketBenchmarks() {
  // Check if we have benchmarks in database
  const benchmarks = await prisma.compensationBenchmark.findMany({
    where: {
      lastUpdated: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    },
    orderBy: {
      baseValue: 'desc',
    },
  })

  if (benchmarks.length > 0) {
    return benchmarks.map((b) => ({
      skillName: b.skillName,
      competency: b.competency || 'General',
      baseValue: b.baseValue,
      premiumPercent: b.premiumPercent,
      marketDemand: b.marketDemand,
      trend: determineTrend(b.marketDemand),
    }))
  }

  // Fallback to sample data
  return getSampleMarketData()
}

function determineTrend(demand: number): 'rising' | 'stable' | 'declining' {
  if (demand >= 80) return 'rising'
  if (demand <= 40) return 'declining'
  return 'stable'
}

/**
 * Sample market data (realistic salary premiums for tech skills)
 */
function getSampleMarketData() {
  return [
    // High-demand emerging tech
    { skillName: 'Machine Learning', competency: 'Technical', baseValue: 45000, premiumPercent: 25, marketDemand: 95, trend: 'rising' as const },
    { skillName: 'Cloud Architecture', competency: 'Technical', baseValue: 40000, premiumPercent: 22, marketDemand: 92, trend: 'rising' as const },
    { skillName: 'Kubernetes', competency: 'Technical', baseValue: 38000, premiumPercent: 20, marketDemand: 90, trend: 'rising' as const },
    { skillName: 'DevOps', competency: 'Technical', baseValue: 35000, premiumPercent: 18, marketDemand: 88, trend: 'rising' as const },
    { skillName: 'React', competency: 'Technical', baseValue: 32000, premiumPercent: 15, marketDemand: 85, trend: 'stable' as const },

    // Leadership & management
    { skillName: 'Team Leadership', competency: 'Leadership', baseValue: 35000, premiumPercent: 20, marketDemand: 80, trend: 'stable' as const },
    { skillName: 'Strategic Planning', competency: 'Leadership', baseValue: 38000, premiumPercent: 22, marketDemand: 82, trend: 'stable' as const },
    { skillName: 'Stakeholder Management', competency: 'Leadership', baseValue: 30000, premiumPercent: 15, marketDemand: 75, trend: 'stable' as const },

    // Core engineering
    { skillName: 'System Design', competency: 'Technical', baseValue: 40000, premiumPercent: 20, marketDemand: 88, trend: 'stable' as const },
    { skillName: 'Python', competency: 'Technical', baseValue: 28000, premiumPercent: 12, marketDemand: 85, trend: 'stable' as const },
    { skillName: 'TypeScript', competency: 'Technical', baseValue: 30000, premiumPercent: 14, marketDemand: 82, trend: 'rising' as const },
    { skillName: 'PostgreSQL', competency: 'Technical', baseValue: 25000, premiumPercent: 10, marketDemand: 75, trend: 'stable' as const },

    // Soft skills
    { skillName: 'Communication', competency: 'Interpersonal', baseValue: 20000, premiumPercent: 10, marketDemand: 90, trend: 'stable' as const },
    { skillName: 'Problem Solving', competency: 'Interpersonal', baseValue: 22000, premiumPercent: 12, marketDemand: 88, trend: 'stable' as const },
    { skillName: 'Mentoring', competency: 'Leadership', baseValue: 18000, premiumPercent: 8, marketDemand: 70, trend: 'stable' as const },

    // Declining/saturated
    { skillName: 'jQuery', competency: 'Technical', baseValue: 8000, premiumPercent: 2, marketDemand: 30, trend: 'declining' as const },
    { skillName: 'PHP', competency: 'Technical', baseValue: 15000, premiumPercent: 5, marketDemand: 45, trend: 'declining' as const },

    // Domain-specific
    { skillName: 'Security', competency: 'Technical', baseValue: 42000, premiumPercent: 24, marketDemand: 94, trend: 'rising' as const },
    { skillName: 'Data Analysis', competency: 'Technical', baseValue: 35000, premiumPercent: 18, marketDemand: 86, trend: 'rising' as const },
    { skillName: 'Product Management', competency: 'Leadership', baseValue: 36000, premiumPercent: 19, marketDemand: 84, trend: 'stable' as const },
  ]
}
