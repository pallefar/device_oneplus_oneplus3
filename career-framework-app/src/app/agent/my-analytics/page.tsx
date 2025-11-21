'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  TrendingUp,
  Award,
  Target,
  Heart,
  Trophy,
  MessageSquare,
  Star,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface PersonalAnalytics {
  profile: {
    name: string
    email: string
    role: string
    department: string | null
    experiencePoints: number
    level: number
    rank: number
    totalUsers: number
    percentile: number
  }
  assessments: {
    total: number
    completed: number
    completionRate: number
    recent: any[]
  }
  skills: {
    byCompetency: Record<string, any[]>
    competencyAverages: Array<{
      competency: string
      avgSelf: number
      avgManager: number
      skillCount: number
    }>
    topStrengths: any[]
    growthAreas: any[]
  }
  learning: {
    activeGoals: any[]
    completedGoals: any[]
    completionRate: number
  }
  endorsements: {
    received: number
    given: number
    topSkills: Array<{ skill: string; count: number }>
    recent: any[]
  }
  gamification: {
    achievements: any[]
    badges: any[]
    xpTimeline: Array<{ date: string; amount: number }>
  }
  social: {
    kudosReceived: number
    kudosGiven: number
    recentKudos: any[]
    aiConversations: number
  }
}

export default function MyAnalyticsPage() {
  const [data, setData] = useState<PersonalAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/personal')
      if (res.ok) {
        const analytics = await res.json()
        setData(analytics)
      }
    } catch (error) {
      console.error('Failed to fetch personal analytics:', error)
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

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }: any) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600',
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
        <h1 className="text-3xl font-bold text-gray-900">My Career Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your professional growth and achievements
        </p>
      </div>

      {/* Profile Summary */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.profile.name}</h2>
            <p className="text-blue-100 mt-1">
              {data.profile.role}
              {data.profile.department && ` • ${data.profile.department}`}
            </p>
            <div className="flex items-center mt-4 space-x-6">
              <div>
                <p className="text-sm text-blue-100">Level</p>
                <p className="text-2xl font-bold">{data.profile.level}</p>
              </div>
              <div>
                <p className="text-sm text-blue-100">Experience Points</p>
                <p className="text-2xl font-bold">{data.profile.experiencePoints} XP</p>
              </div>
              <div>
                <p className="text-sm text-blue-100">Rank</p>
                <p className="text-2xl font-bold">
                  #{data.profile.rank} of {data.profile.totalUsers}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-100">Percentile</p>
                <p className="text-2xl font-bold">Top {100 - data.profile.percentile}%</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Trophy className="w-20 h-20 opacity-50" />
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Assessment Completion"
          value={`${data.assessments.completionRate}%`}
          subtitle={`${data.assessments.completed} / ${data.assessments.total} completed`}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Skills Endorsed"
          value={data.endorsements.received}
          subtitle={`Gave ${data.endorsements.given} endorsements`}
          icon={Star}
          color="yellow"
        />
        <StatCard
          title="Learning Goals"
          value={data.learning.activeGoals.length}
          subtitle={`${data.learning.completionRate}% completion rate`}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Kudos Received"
          value={data.social.kudosReceived}
          subtitle={`Gave ${data.social.kudosGiven} kudos`}
          icon={Heart}
          color="red"
        />
      </div>

      {/* Competency Radar */}
      <Card title="Skills by Competency" className="mb-6">
        <div className="space-y-4">
          {data.skills.competencyAverages.map((comp) => (
            <div key={comp.competency}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">{comp.competency}</span>
                  <span className="text-xs text-gray-500 ml-2">({comp.skillCount} skills)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-600">
                    Self: {comp.avgSelf.toFixed(1)}
                  </div>
                  <div className="text-xs font-semibold text-blue-600">
                    Manager: {comp.avgManager.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${(comp.avgSelf / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(comp.avgManager / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Strengths */}
        <Card title="Top Strengths">
          <div className="space-y-3">
            {data.skills.topStrengths.slice(0, 8).map((strength, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-l-4 border-green-400 pl-3"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{strength.skill}</div>
                  <div className="text-xs text-gray-500">{strength.competency}</div>
                </div>
                <div className="flex items-center">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-semibold text-green-600">
                    {strength.rating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Growth Areas */}
        <Card title="Growth Areas">
          <div className="space-y-3">
            {data.skills.growthAreas.slice(0, 8).map((area, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-l-4 border-orange-400 pl-3"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{area.skill}</div>
                  <div className="text-xs text-gray-500">{area.competency}</div>
                </div>
                <div className="flex items-center">
                  <ArrowDown className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm font-semibold text-orange-600">
                    {area.rating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Most Endorsed Skills */}
        <Card title="Most Endorsed Skills">
          <div className="space-y-3">
            {data.endorsements.topSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">{skill.skill}</div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" />
                  <span className="text-sm font-semibold text-gray-900">
                    {skill.count} endorsements
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Achievements */}
        <Card title="Recent Achievements">
          <div className="space-y-3">
            {data.gamification.achievements.slice(0, 6).map((achievement, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-gray-500">{achievement.description}</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-semibold">
                  +{achievement.xpReward} XP
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Learning Goals */}
      {data.learning.activeGoals.length > 0 && (
        <Card title="Active Learning Goals" className="mb-6">
          <div className="space-y-4">
            {data.learning.activeGoals.map((goal) => (
              <div key={goal.id} className="border-l-4 border-blue-400 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">{goal.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Kudos */}
      {data.social.recentKudos.length > 0 && (
        <Card title="Recent Kudos" className="mb-6">
          <div className="space-y-4">
            {data.social.recentKudos.map((kudos, idx) => (
              <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-900 mb-2">{kudos.message}</p>
                <div className="flex items-center text-xs text-gray-600">
                  <Heart className="w-3 h-3 text-red-500 mr-1" />
                  From {kudos.giver} •{' '}
                  {new Date(kudos.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
