'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  Award,
  Building2,
  Lightbulb,
} from 'lucide-react'

interface CompensationAnalytics {
  summary: {
    totalUsers: number
    totalSkillValue: number
    avgSkillValue: number
    uniqueSkills: number
  }
  skillDistribution: {
    bySkill: Array<{
      skillName: string
      userCount: number
      avgLevel: number
      totalValue: number
      avgValue: number
    }>
    byCompetency: Array<{
      competency: string
      totalValue: number
      percentage: number
    }>
    gaps: Array<{
      skillName: string
      competency: string
      demand: number
      estimatedValue: number
      usersWithSkill: number
      recommendedAction: string
    }>
  }
  departments: Array<{
    department: string
    userCount: number
    totalValue: number
    avgValue: number
    topSkills: Array<{ skill: string; count: number }>
  }>
  investments: Array<{
    skillName: string
    userCount: number
    currentAvgLevel: string
    potentialValue: number
    recommendation: string
  }>
  topPerformers: Array<{
    name: string
    department: string | null
    role: string
    totalValue: number
    skillCount: number
    topSkills: string[]
  }>
  equity: Array<{
    role: string
    userCount: number
    avgValue: number
    medianValue: number
    minValue: number
    maxValue: number
    spread: number
  }>
  recommendations: Array<{
    type: string
    priority: string
    title: string
    description: string
    action: string
    impact: string
  }>
}

export default function CompensationAnalyticsPage() {
  const [data, setData] = useState<CompensationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/compensation/analytics')
      if (res.ok) {
        const analytics = await res.json()
        setData(analytics)
      }
    } catch (error) {
      console.error('Failed to fetch compensation analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }: any) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
    }

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Compensation Analytics</h1>
        <p className="text-gray-600 mt-1">
          Organization-wide skill valuation and compensation insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Skill Value"
          value={`$${(data.summary.totalSkillValue / 1000000).toFixed(1)}M`}
          subtitle="Organization skill portfolio"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Avg. Value per Person"
          value={`$${Math.round(data.summary.avgSkillValue / 1000)}k`}
          subtitle="Average skill value"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Unique Skills"
          value={data.summary.uniqueSkills}
          subtitle="Different skills in org"
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Total Team"
          value={data.summary.totalUsers}
          subtitle="Assessed users"
          icon={Users}
          color="orange"
        />
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card title="Strategic Recommendations" className="mb-6">
          <div className="space-y-3">
            {data.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`border-l-4 pl-4 py-3 rounded-r-lg ${
                  rec.priority === 'high'
                    ? 'bg-red-50 border-red-400'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <Lightbulb className="w-4 h-4 mr-2 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                    <div className="flex items-center text-xs text-gray-600">
                      <span
                        className={`px-2 py-1 rounded font-semibold mr-2 ${
                          rec.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{rec.action}</span>
                      <span className="ml-2 text-gray-500">Impact: {rec.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Critical Skill Gaps */}
        {data.skillDistribution.gaps.length > 0 && (
          <Card title="Critical Skill Gaps">
            <p className="text-sm text-gray-600 mb-4">
              High-demand skills missing from organization
            </p>
            <div className="space-y-3">
              {data.skillDistribution.gaps.slice(0, 8).map((gap, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-l-4 border-red-400 pl-3 bg-red-50 p-2 rounded-r"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{gap.skillName}</div>
                    <div className="text-xs text-gray-600">{gap.competency}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-bold text-red-600">
                      {gap.demand}/100 demand
                    </div>
                    <div className="text-xs text-gray-500">
                      ${gap.estimatedValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Investment Opportunities */}
        {data.investments.length > 0 && (
          <Card title="Training Investment Opportunities">
            <p className="text-sm text-gray-600 mb-4">
              Skills worth developing through training programs
            </p>
            <div className="space-y-3">
              {data.investments.slice(0, 8).map((inv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-l-4 border-green-400 pl-3 bg-green-50 p-2 rounded-r"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{inv.skillName}</div>
                    <div className="text-xs text-gray-600">
                      {inv.userCount} users, avg level {inv.currentAvgLevel}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-bold text-green-600">
                      +${inv.potentialValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{inv.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Department Analysis */}
      {data.departments.length > 0 && (
        <Card title="Department Analysis" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.departments.map((dept, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                    <h4 className="font-semibold text-gray-900">{dept.department}</h4>
                  </div>
                  <span className="text-xs text-gray-500">{dept.userCount} users</span>
                </div>
                <div className="mb-3">
                  <div className="text-2xl font-bold text-green-600">
                    ${(dept.avgValue / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-gray-500">Avg. skill value per person</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Top Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {dept.topSkills.slice(0, 3).map((skill, sidx) => (
                      <span
                        key={sidx}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {skill.skill} ({skill.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Skill Value Distribution */}
        <Card title="Top 15 Skills by Value">
          <div className="space-y-3">
            {data.skillDistribution.bySkill.slice(0, 15).map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{skill.skillName}</span>
                    <span className="text-xs text-gray-500">
                      {skill.userCount} users, avg {skill.avgLevel.toFixed(1)}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((skill.totalValue / data.summary.totalSkillValue) * 100 * 10, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-bold text-gray-900">
                    ${(skill.totalValue / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Competency Distribution */}
        <Card title="Value by Competency">
          <div className="space-y-4">
            {data.skillDistribution.byCompetency.map((comp, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{comp.competency}</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${(comp.totalValue / 1000000).toFixed(2)}M ({comp.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full"
                    style={{ width: `${comp.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      {data.topPerformers.length > 0 && (
        <Card title="Top 20 Performers by Skill Value" className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Skill Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Top Skills
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topPerformers.map((performer, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0
                            ? 'bg-yellow-500'
                            : idx === 1
                            ? 'bg-gray-400'
                            : idx === 2
                            ? 'bg-orange-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {performer.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {performer.department || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{performer.role}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      ${(performer.totalValue / 1000).toFixed(0)}k
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {performer.topSkills.map((skill, sidx) => (
                          <span
                            key={sidx}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pay Equity Analysis */}
      {data.equity.length > 0 && (
        <Card title="Skill Value Equity by Role" className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Analyze skill value distribution across roles to identify potential equity issues
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Users
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Avg Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Median
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Range
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Spread
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.equity.map((role, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{role.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{role.userCount}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      ${(role.avgValue / 1000).toFixed(0)}k
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ${(role.medianValue / 1000).toFixed(0)}k
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ${(role.minValue / 1000).toFixed(0)}k - ${(role.maxValue / 1000).toFixed(0)}k
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded font-semibold ${
                          role.spread > 50
                            ? 'bg-red-100 text-red-800'
                            : role.spread > 30
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {role.spread}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Privacy & Data Usage</h4>
            <p className="text-sm text-blue-800">
              All data shown is aggregated and privacy-preserving. No individual salary data is
              collected or displayed. Skill valuations are market estimates based on industry
              benchmarks and do not represent actual compensation data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
