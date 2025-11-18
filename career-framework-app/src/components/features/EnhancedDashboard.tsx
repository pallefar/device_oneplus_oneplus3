'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { GamificationWidget } from '@/components/features/GamificationWidget'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

interface DashboardData {
  pendingAssessments: any[]
  recentProgress: any[]
  topSkillsToImprove: any[]
  achievements: any[]
  upcomingDeadlines: any[]
  learningResources: any[]
}

export function EnhancedAgentDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/enhanced')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Loading your dashboard..." />
  }

  if (!data) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Unable to load dashboard data</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
      {/* Actionable Next Steps */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Your Next Steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.pendingAssessments.length > 0 && (
            <Link
              href={`/agent/assessments/${data.pendingAssessments[0].id}`}
              className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-semibold text-orange-900 uppercase">
                      Action Required
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Complete Self-Assessment
                  </h3>
                  <p className="text-sm text-gray-700">
                    {data.pendingAssessments[0].assessment?.name}
                  </p>
                  {data.pendingAssessments[0].assessment?.dueDate && (
                    <p className="text-xs text-orange-700 mt-2">
                      Due: {new Date(data.pendingAssessments[0].assessment.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-orange-600 flex-shrink-0" />
              </div>
            </Link>
          )}

          {data.topSkillsToImprove.length > 0 && (
            <Link
              href="/agent/learning"
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900 uppercase">
                      Recommended
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Develop Your Skills</h3>
                  <p className="text-sm text-gray-700">
                    Focus on: {data.topSkillsToImprove[0].skillName}
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Current rating: {data.topSkillsToImprove[0].currentRating}/5
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              </div>
            </Link>
          )}

          {data.recentProgress.length > 0 && (
            <Link
              href="/agent/progress"
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-semibold text-green-900 uppercase">
                      Keep Going!
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Track Your Progress</h3>
                  <p className="text-sm text-gray-700">
                    {data.recentProgress.filter((p: any) => p.trendDirection === 'improving').length}{' '}
                    skills improving
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
            </Link>
          )}

          {data.learningResources.length > 0 && (
            <Link
              href="/agent/learning"
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900 uppercase">
                      Learning
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Explore Resources</h3>
                  <p className="text-sm text-gray-700">
                    {data.learningResources.length} curated courses for you
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600 flex-shrink-0" />
              </div>
            </Link>
          )}
        </div>
      </Card>

      {/* Skills to Improve */}
      {data.topSkillsToImprove.length > 0 && (
        <Card title="Top Skills to Develop">
          <div className="space-y-3">
            {data.topSkillsToImprove.slice(0, 5).map((skill: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{skill.skillName}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        skill.currentRating < 2
                          ? 'bg-red-100 text-red-800'
                          : skill.currentRating < 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {skill.currentRating}/5
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{skill.competency}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        skill.currentRating < 2
                          ? 'bg-red-500'
                          : skill.currentRating < 3
                          ? 'bg-orange-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(skill.currentRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/agent/learning"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              View learning resources <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      )}

      {/* Recent Achievements */}
      {data.achievements.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Recent Achievements</h2>
          </div>
          <div className="space-y-3">
            {data.achievements.map((achievement: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900">{achievement.title}</p>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(achievement.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Assessments Completed</p>
              <p className="text-3xl font-bold mt-1">
                {data.recentProgress.filter((p: any) => p.assessmentCount > 0).length}
              </p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Skills Improving</p>
              <p className="text-3xl font-bold mt-1">
                {data.recentProgress.filter((p: any) => p.trendDirection === 'improving').length}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Learning Resources</p>
              <p className="text-3xl font-bold mt-1">{data.learningResources.length}</p>
            </div>
            <BookOpen className="w-10 h-10 text-purple-200" />
          </div>
        </Card>
      </div>
      </div>

      {/* Gamification Sidebar */}
      <div className="lg:col-span-1">
        <GamificationWidget />
      </div>
    </div>
  )
}
