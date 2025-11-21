import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/compensation/analytics
 * Organization-wide compensation analytics for admins
 * Privacy-preserving: Shows aggregated data, no individual salaries
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 1. Get all users with their skills from finalized assessments
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
      },
      include: {
        agentAssignments: {
          where: { status: 'FINALIZED' },
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
          },
          orderBy: { managerCompletedAt: 'desc' },
          take: 1, // Most recent assessment only
        },
      },
    })

    // 2. Get market benchmarks
    const marketBenchmarks = await getMarketBenchmarks()
    const benchmarkMap = new Map(marketBenchmarks.map((b) => [b.skillName, b]))

    // 3. Calculate skill value for each user
    const userValuations = users
      .map((user) => {
        if (user.agentAssignments.length === 0) return null

        const latestAssessment = user.agentAssignments[0]
        const skills = latestAssessment.responses

        // Calculate total skill portfolio value
        const skillValues = skills.map((response) => {
          const benchmark = benchmarkMap.get(response.skill.name)
          const skillLevel = response.managerRating || response.selfRating || 0

          if (!benchmark) {
            return {
              skillName: response.skill.name,
              competency: response.skill.competency.name,
              value: skillLevel * 5000,
            }
          }

          const levelMultiplier = skillLevel / 5
          const value = benchmark.baseValue * levelMultiplier

          return {
            skillName: response.skill.name,
            competency: response.skill.competency.name,
            level: skillLevel,
            value: Math.round(value),
            demand: benchmark.marketDemand,
          }
        })

        const totalValue = skillValues.reduce((sum, s) => sum + s.value, 0)

        return {
          userId: user.id,
          name: user.name,
          role: user.role,
          department: user.department,
          totalSkillValue: totalValue,
          skillCount: skills.length,
          topSkills: skillValues.sort((a, b) => b.value - a.value).slice(0, 5),
        }
      })
      .filter((u) => u !== null)
      .sort((a, b) => b!.totalSkillValue - a!.totalSkillValue)

    // 4. Organization-wide skill distribution
    const allSkills = new Map<string, { count: number; avgLevel: number; totalValue: number }>()

    userValuations.forEach((user) => {
      user!.topSkills.forEach((skill) => {
        const existing = allSkills.get(skill.skillName) || {
          count: 0,
          avgLevel: 0,
          totalValue: 0,
        }
        allSkills.set(skill.skillName, {
          count: existing.count + 1,
          avgLevel: existing.avgLevel + (skill.level || 0),
          totalValue: existing.totalValue + skill.value,
        })
      })
    })

    const skillDistribution = Array.from(allSkills.entries())
      .map(([skillName, data]) => ({
        skillName,
        userCount: data.count,
        avgLevel: data.count > 0 ? data.avgLevel / data.count : 0,
        totalValue: data.totalValue,
        avgValue: data.totalValue / data.count,
      }))
      .sort((a, b) => b.userCount - a.userCount)

    // 5. Competency value distribution
    const competencyValues = new Map<string, number>()
    userValuations.forEach((user) => {
      user!.topSkills.forEach((skill) => {
        const current = competencyValues.get(skill.competency) || 0
        competencyValues.set(skill.competency, current + skill.value)
      })
    })

    const competencyDistribution = Array.from(competencyValues.entries())
      .map(([competency, totalValue]) => ({
        competency,
        totalValue,
        percentage: (totalValue / userValuations.reduce((sum, u) => sum + u!.totalSkillValue, 0)) * 100,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)

    // 6. Department analysis
    const departmentAnalysis = new Map<
      string,
      { users: number; totalValue: number; avgValue: number; topSkills: Map<string, number> }
    >()

    userValuations.forEach((user) => {
      const dept = user!.department || 'Unassigned'
      const existing = departmentAnalysis.get(dept) || {
        users: 0,
        totalValue: 0,
        avgValue: 0,
        topSkills: new Map(),
      }

      user!.topSkills.forEach((skill) => {
        existing.topSkills.set(skill.skillName, (existing.topSkills.get(skill.skillName) || 0) + 1)
      })

      departmentAnalysis.set(dept, {
        users: existing.users + 1,
        totalValue: existing.totalValue + user!.totalSkillValue,
        avgValue: 0, // Will calculate after
        topSkills: existing.topSkills,
      })
    })

    const departmentStats = Array.from(departmentAnalysis.entries()).map(([department, data]) => ({
      department,
      userCount: data.users,
      totalValue: data.totalValue,
      avgValue: Math.round(data.totalValue / data.users),
      topSkills: Array.from(data.topSkills.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count })),
    }))

    // 7. Skill gaps (high-value skills with low coverage)
    const organizationCoverage = new Set(skillDistribution.map((s) => s.skillName))
    const criticalGaps = marketBenchmarks
      .filter((b) => !organizationCoverage.has(b.skillName) && b.marketDemand >= 80)
      .sort((a, b) => b.marketDemand - a.marketDemand)
      .slice(0, 10)
      .map((b) => ({
        skillName: b.skillName,
        competency: b.competency,
        demand: b.marketDemand,
        estimatedValue: Math.round(b.baseValue * 0.8),
        usersWithSkill: 0,
        recommendedAction: 'Hire or train',
      }))

    // 8. Investment opportunities (skills worth developing)
    const investmentOpportunities = skillDistribution
      .filter((s) => s.avgLevel < 4 && s.userCount >= 3) // Skills team has but could improve
      .sort((a, b) => b.avgValue - a.avgValue)
      .slice(0, 10)
      .map((s) => {
        const benchmark = benchmarkMap.get(s.skillName)
        const potentialGain = benchmark
          ? Math.round(benchmark.baseValue * (1 - s.avgLevel / 5) * s.userCount)
          : Math.round(s.avgValue * 0.3 * s.userCount)

        return {
          skillName: s.skillName,
          userCount: s.userCount,
          currentAvgLevel: s.avgLevel.toFixed(1),
          potentialValue: potentialGain,
          recommendation: 'Training program',
        }
      })

    // 9. Top performers by skill value
    const topPerformers = userValuations.slice(0, 20).map((u) => ({
      name: u!.name,
      department: u!.department,
      role: u!.role,
      totalValue: u!.totalSkillValue,
      skillCount: u!.skillCount,
      topSkills: u!.topSkills.map((s) => s.skillName).slice(0, 3),
    }))

    // 10. Pay equity analysis (simulated with skill values as proxy)
    const valuesByRole = new Map<string, number[]>()
    userValuations.forEach((user) => {
      const role = user!.role
      if (!valuesByRole.has(role)) {
        valuesByRole.set(role, [])
      }
      valuesByRole.get(role)!.push(user!.totalSkillValue)
    })

    const equityAnalysis = Array.from(valuesByRole.entries()).map(([role, values]) => {
      values.sort((a, b) => a - b)
      const median = values[Math.floor(values.length / 2)]
      const min = Math.min(...values)
      const max = Math.max(...values)
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length

      return {
        role,
        userCount: values.length,
        avgValue: Math.round(avg),
        medianValue: Math.round(median),
        minValue: Math.round(min),
        maxValue: Math.round(max),
        spread: Math.round(((max - min) / avg) * 100), // Percentage spread
      }
    })

    // 11. Recommendations
    const recommendations = []

    // Critical gaps
    if (criticalGaps.length > 0) {
      recommendations.push({
        type: 'skill-gap',
        priority: 'high',
        title: `${criticalGaps.length} high-demand skills missing from organization`,
        description: `Skills like ${criticalGaps.slice(0, 3).map((g) => g.skillName).join(', ')} are in high market demand but no one on the team has them.`,
        action: 'Consider hiring or training programs',
        impact: 'high',
      })
    }

    // Investment opportunities
    if (investmentOpportunities.length > 0) {
      const topInvestment = investmentOpportunities[0]
      recommendations.push({
        type: 'training',
        priority: 'medium',
        title: `Training ${topInvestment.userCount} users in ${topInvestment.skillName}`,
        description: `${topInvestment.userCount} team members have ${topInvestment.skillName} but could improve to higher levels, adding approximately $${topInvestment.potentialValue.toLocaleString()} in value.`,
        action: 'Create training program',
        impact: 'medium',
      })
    }

    // Pay equity
    const highSpreadRoles = equityAnalysis.filter((e) => e.spread > 50)
    if (highSpreadRoles.length > 0) {
      recommendations.push({
        type: 'equity',
        priority: 'medium',
        title: `Review compensation equity for ${highSpreadRoles.length} roles`,
        description: `Roles like ${highSpreadRoles.map((r) => r.role).join(', ')} show high skill value spread, which may indicate compensation inequity.`,
        action: 'Conduct equity review',
        impact: 'medium',
      })
    }

    return NextResponse.json({
      summary: {
        totalUsers: userValuations.length,
        totalSkillValue: userValuations.reduce((sum, u) => sum + u!.totalSkillValue, 0),
        avgSkillValue: Math.round(
          userValuations.reduce((sum, u) => sum + u!.totalSkillValue, 0) / userValuations.length
        ),
        uniqueSkills: skillDistribution.length,
      },
      skillDistribution: {
        bySkill: skillDistribution.slice(0, 20),
        byCompetency: competencyDistribution,
        gaps: criticalGaps,
      },
      departments: departmentStats,
      investments: investmentOpportunities,
      topPerformers,
      equity: equityAnalysis,
      recommendations,
    })
  } catch (error) {
    console.error('Error fetching admin compensation analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compensation analytics' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get market benchmarks
 */
async function getMarketBenchmarks() {
  const benchmarks = await prisma.compensationBenchmark.findMany({
    where: {
      lastUpdated: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  })

  if (benchmarks.length > 0) {
    return benchmarks.map((b) => ({
      skillName: b.skillName,
      competency: b.competency || 'General',
      baseValue: b.baseValue,
      premiumPercent: b.premiumPercent,
      marketDemand: b.marketDemand,
    }))
  }

  // Fallback to sample data
  return getSampleMarketData()
}

function getSampleMarketData() {
  return [
    { skillName: 'Machine Learning', competency: 'Technical', baseValue: 45000, premiumPercent: 25, marketDemand: 95 },
    { skillName: 'Cloud Architecture', competency: 'Technical', baseValue: 40000, premiumPercent: 22, marketDemand: 92 },
    { skillName: 'Kubernetes', competency: 'Technical', baseValue: 38000, premiumPercent: 20, marketDemand: 90 },
    { skillName: 'DevOps', competency: 'Technical', baseValue: 35000, premiumPercent: 18, marketDemand: 88 },
    { skillName: 'React', competency: 'Technical', baseValue: 32000, premiumPercent: 15, marketDemand: 85 },
    { skillName: 'Team Leadership', competency: 'Leadership', baseValue: 35000, premiumPercent: 20, marketDemand: 80 },
    { skillName: 'Strategic Planning', competency: 'Leadership', baseValue: 38000, premiumPercent: 22, marketDemand: 82 },
    { skillName: 'Stakeholder Management', competency: 'Leadership', baseValue: 30000, premiumPercent: 15, marketDemand: 75 },
    { skillName: 'System Design', competency: 'Technical', baseValue: 40000, premiumPercent: 20, marketDemand: 88 },
    { skillName: 'Python', competency: 'Technical', baseValue: 28000, premiumPercent: 12, marketDemand: 85 },
    { skillName: 'TypeScript', competency: 'Technical', baseValue: 30000, premiumPercent: 14, marketDemand: 82 },
    { skillName: 'PostgreSQL', competency: 'Technical', baseValue: 25000, premiumPercent: 10, marketDemand: 75 },
    { skillName: 'Communication', competency: 'Interpersonal', baseValue: 20000, premiumPercent: 10, marketDemand: 90 },
    { skillName: 'Problem Solving', competency: 'Interpersonal', baseValue: 22000, premiumPercent: 12, marketDemand: 88 },
    { skillName: 'Mentoring', competency: 'Leadership', baseValue: 18000, premiumPercent: 8, marketDemand: 70 },
    { skillName: 'Security', competency: 'Technical', baseValue: 42000, premiumPercent: 24, marketDemand: 94 },
    { skillName: 'Data Analysis', competency: 'Technical', baseValue: 35000, premiumPercent: 18, marketDemand: 86 },
    { skillName: 'Product Management', competency: 'Leadership', baseValue: 36000, premiumPercent: 19, marketDemand: 84 },
  ]
}
