'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  Lightbulb,
  Award,
} from 'lucide-react'

interface SkillValuation {
  skillName: string
  competency: string
  currentLevel: number
  marketValue: number
  premium: number
  demand: number
  trend: 'rising' | 'stable' | 'declining'
}

interface SkillGap {
  skillName: string
  competency: string
  potentialValue: number
  demand: number
  premium: number
  trend: 'rising' | 'stable' | 'declining'
  estimatedTimeToAcquire: string
}

interface Recommendation {
  type: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  potentialGain: number
}

interface CompensationData {
  profile: {
    role: string
    department: string | null
    experiencePoints: number
    level: number
  }
  skillValuation: {
    totalValue: number
    skillCount: number
    marketPercentile: number
    topSkills: SkillValuation[]
    byCompetency: Array<{
      competency: string
      totalValue: number
      avgLevel: number
      skillCount: number
    }>
  }
  opportunities: {
    highValueGaps: SkillGap[]
    totalPotentialGain: number
    recommendations: Recommendation[]
  }
  marketInsights: {
    trendingSkills: Array<{
      skillName: string
      demand: number
      avgValue: number
    }>
    decliningSkills: Array<{
      skillName: string
      demand: number
    }>
  }
}

export default function SkillValuationPage() {
  const [data, setData] = useState<CompensationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchValuationData()
  }, [])

  const fetchValuationData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/compensation/personal')
      if (res.ok) {
        const valuationData = await res.json()
        setData(valuationData)
      }
    } catch (error) {
      console.error('Failed to fetch skill valuation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <span className="w-4 h-4 inline-block text-gray-400">—</span>
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Skill Valuation & Compensation Insights</h1>
        <p className="text-gray-600 mt-1">
          Understand the market value of your skills and opportunities for growth
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Skill Value"
          value={`$${data.skillValuation.totalValue.toLocaleString()}`}
          subtitle="Estimated annual market premium"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Market Percentile"
          value={`${data.skillValuation.marketPercentile}%`}
          subtitle="Top percentile in organization"
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Valued Skills"
          value={data.skillValuation.skillCount}
          subtitle="Skills with market value"
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="Potential Gain"
          value={`$${data.opportunities.totalPotentialGain.toLocaleString()}`}
          subtitle="From top 5 skill opportunities"
          icon={Target}
          color="orange"
        />
      </div>

      {/* Recommendations */}
      {data.opportunities.recommendations.length > 0 && (
        <Card title="Personalized Recommendations" className="mb-6">
          <div className="space-y-4">
            {data.opportunities.recommendations.map((rec, idx) => (
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
                        className={`px-2 py-1 rounded font-semibold mr-2 ${getPriorityColor(rec.priority)}`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{rec.action}</span>
                    </div>
                  </div>
                  {rec.potentialGain > 0 && (
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-600">
                        +${rec.potentialGain.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">potential value</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Valued Skills */}
      <Card title="Your Top Valued Skills" className="mb-6">
        <div className="space-y-3">
          {data.skillValuation.topSkills.map((skill, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{skill.skillName}</span>
                    <span className="text-xs text-gray-500 ml-2">({skill.competency})</span>
                    {getTrendIcon(skill.trend)}
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      Level {skill.currentLevel}/5
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    ${skill.marketValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {skill.demand}/100 demand
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Value by Competency */}
        <Card title="Value by Competency">
          <div className="space-y-4">
            {data.skillValuation.byCompetency.map((comp, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comp.competency}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({comp.skillCount} skills, avg {comp.avgLevel.toFixed(1)})
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    ${comp.totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                    style={{
                      width: `${(comp.totalValue / data.skillValuation.totalValue) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Market Insights */}
        <Card title="Market Insights">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                Trending Skills (Hot Right Now)
              </h4>
              <div className="space-y-2">
                {data.marketInsights.trendingSkills.slice(0, 5).map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{skill.skillName}</span>
                    <div className="flex items-center">
                      <span className="text-green-600 font-semibold mr-2">
                        ${skill.avgValue.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-xs">{skill.demand}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {data.marketInsights.decliningSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
                  Declining Skills
                </h4>
                <div className="space-y-2">
                  {data.marketInsights.decliningSkills.map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{skill.skillName}</span>
                      <span className="text-red-600 text-xs">{skill.demand}/100 demand</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* High-Value Skill Gaps */}
      {data.opportunities.highValueGaps.length > 0 && (
        <Card title="High-Value Learning Opportunities" className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Skills you don't have yet that could significantly increase your market value
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.opportunities.highValueGaps.slice(0, 6).map((gap, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">{gap.skillName}</h4>
                      {getTrendIcon(gap.trend)}
                    </div>
                    <p className="text-xs text-gray-500">{gap.competency}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      +${gap.potentialValue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">
                    {gap.demand}/100 demand
                  </span>
                  <span className="text-gray-500">{gap.estimatedTimeToAcquire}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              About These Valuations
            </h4>
            <p className="text-sm text-blue-800">
              These estimates are based on market data and skill levels from your assessments. They
              represent the approximate premium value each skill adds to compensation in the current
              market. Actual compensation depends on many factors including location, industry,
              experience, and negotiation. Use these insights for career planning and skill
              development guidance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
