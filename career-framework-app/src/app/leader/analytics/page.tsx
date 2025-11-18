'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react'

export default function LeaderAnalyticsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<any>(null)
  const [completionTrends, setCompletionTrends] = useState<any[]>([])
  const [skillGaps, setSkillGaps] = useState<any[]>([])
  const [competencies, setCompetencies] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    if (session) {
      fetchAllAnalytics()
    }
  }, [session])

  const fetchAllAnalytics = async () => {
    try {
      const [overview, completion, skills, comps, users] = await Promise.all([
        fetch('/api/analytics?type=overview').then((r) => r.json()),
        fetch('/api/analytics?type=completion').then((r) => r.json()),
        fetch('/api/analytics?type=skills').then((r) => r.json()),
        fetch('/api/analytics?type=competencies').then((r) => r.json()),
        fetch('/api/analytics?type=users').then((r) => r.json()),
      ])

      setOverviewData(overview)
      setCompletionTrends(completion.trends || [])
      setSkillGaps(skills.skillGaps?.slice(0, 8) || [])
      setCompetencies(comps.competencies || [])
      setTopPerformers(users.topPerformers || [])
    } catch (error) {
      showToast('error', 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading team analytics..." />
  }

  if (!overviewData) {
    return null
  }

  const statusData = Object.entries(overviewData.overview.assignmentsByStatus).map(
    ([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    })
  )

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  const totalAssignments = statusData.reduce((sum, s) => sum + (s.count as number), 0)
  const completedCount =
    (overviewData.overview.assignmentsByStatus.FINALIZED || 0) +
    (overviewData.overview.assignmentsByStatus.SELF_COMPLETED || 0)
  const completionRate =
    totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Performance insights for your team members
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Assignments</p>
                <p className="text-3xl font-bold mt-1">{totalAssignments}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completion Rate</p>
                <p className="text-3xl font-bold mt-1">{completionRate}%</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg. Completion</p>
                <p className="text-3xl font-bold mt-1">
                  {overviewData.overview.avgCompletionDays}
                  <span className="text-lg ml-1">days</span>
                </p>
              </div>
              <Clock className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending Reviews</p>
                <p className="text-3xl font-bold mt-1">
                  {overviewData.overview.assignmentsByStatus.SELF_COMPLETED || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Assignment Status */}
          <Card title="Assessment Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.status}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Team Members */}
          {topPerformers.length > 0 && (
            <Card title="Team Performance">
              <div className="space-y-3">
                {topPerformers.slice(0, 5).map((performer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                          idx === 0
                            ? 'bg-yellow-500'
                            : idx === 1
                            ? 'bg-gray-400'
                            : idx === 2
                            ? 'bg-orange-600'
                            : 'bg-blue-500'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{performer.name}</p>
                        <p className="text-xs text-gray-500">{performer.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{performer.avgRating}</p>
                      <p className="text-xs text-gray-500">{performer.assignmentCount} done</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Completion Trends */}
        {completionTrends.length > 0 && (
          <Card title="Team Assessment Trends" className="mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#3B82F6"
                  name="Created"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="selfCompleted"
                  stroke="#10B981"
                  name="Self-Completed"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="managerCompleted"
                  stroke="#8B5CF6"
                  name="Finalized"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Competency Performance Radar */}
        {competencies.length > 0 && (
          <Card title="Team Competency Performance" className="mb-8">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={competencies}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competency" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Self Rating"
                  dataKey="selfRating"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Your Rating"
                  dataKey="managerRating"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Skill Gaps */}
        {skillGaps.length > 0 && (
          <Card title="Key Skill Development Areas" className="mb-8">
            <div className="space-y-4">
              {skillGaps.map((skill, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{skill.skill}</p>
                      <p className="text-xs text-gray-500">
                        {skill.competency} • Expected: {skill.expectedLevel}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        Math.abs(skill.gap) > 1
                          ? 'bg-red-100 text-red-800'
                          : Math.abs(skill.gap) > 0.5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      Gap: {skill.gap > 0 ? '+' : ''}
                      {skill.gap}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-blue-600 text-xs">Team Self-Rating</span>
                        <span className="font-semibold text-xs">{skill.selfRating}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(skill.selfRating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-green-600 text-xs">Your Rating</span>
                        <span className="font-semibold text-xs">{skill.managerRating}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(skill.managerRating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on {skill.assessmentCount} assessment{skill.assessmentCount !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        {overviewData.recentActivity?.length > 0 && (
          <Card title="Recent Team Activity">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assessment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Team Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {overviewData.recentActivity.map((activity: any) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{activity.assessment}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{activity.agent}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            activity.status === 'FINALIZED'
                              ? 'bg-green-100 text-green-800'
                              : activity.status === 'SELF_COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {activity.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(activity.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
